/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import '../util/ng_dev_mode';

import {ChangeDetectionStrategy} from '../change_detection/constants';
import {Mutable, Type} from '../interface/type';
import {NgModuleDef} from '../metadata/ng_module';
import {SchemaMetadata} from '../metadata/schema';
import {ViewEncapsulation} from '../metadata/view';
import {noSideEffects} from '../util/closure';
import {stringify} from '../util/stringify';

import {EMPTY_ARRAY, EMPTY_OBJ} from './empty';
import {NG_COMPONENT_DEF, NG_DIRECTIVE_DEF, NG_MODULE_DEF, NG_PIPE_DEF} from './fields';
import {ComponentDef, ComponentDefFeature, ComponentTemplate, ComponentType, ContentQueriesFunction, DirectiveDef, DirectiveDefFeature, DirectiveType, DirectiveTypesOrFactory, FactoryFn, HostBindingsFunction, PipeDef, PipeType, PipeTypesOrFactory, ViewQueriesFunction, ΔBaseDef} from './interfaces/definition';
// while SelectorFlags is unused here, it's required so that types don't get resolved lazily
// see: https://github.com/Microsoft/web-build-tools/issues/1050
import {CssSelectorList, SelectorFlags} from './interfaces/projection';

let _renderCompCount = 0;

/**
 * Create a component definition object.
 *
 *
 * # Example
 * ```
 * class MyDirective {
 *   // Generated by Angular Template Compiler
 *   // [Symbol] syntax will not be supported by TypeScript until v2.7
 *   static ngComponentDef = defineComponent({
 *     ...
 *   });
 * }
 * ```
 * @codeGenApi
 */
export function ΔdefineComponent<T>(componentDefinition: {
  /**
   * Directive type, needed to configure the injector.
   */
  type: Type<T>;

  /** The selectors that will be used to match nodes to this component. */
  selectors: CssSelectorList;

  /**
   * Factory method used to create an instance of directive.
   */
  factory: FactoryFn<T>;

  /**
   * The number of nodes, local refs, and pipes in this component template.
   *
   * Used to calculate the length of this component's LView array, so we
   * can pre-fill the array and set the binding start index.
   */
  // TODO(kara): remove queries from this count
  consts: number;

  /**
   * The number of bindings in this component template (including pure fn bindings).
   *
   * Used to calculate the length of this component's LView array, so we
   * can pre-fill the array and set the host binding start index.
   */
  vars: number;

  /**
   * A map of input names.
   *
   * The format is in: `{[actualPropertyName: string]:(string|[string, string])}`.
   *
   * Given:
   * ```
   * class MyComponent {
   *   @Input()
   *   publicInput1: string;
   *
   *   @Input('publicInput2')
   *   declaredInput2: string;
   * }
   * ```
   *
   * is described as:
   * ```
   * {
   *   publicInput1: 'publicInput1',
   *   declaredInput2: ['publicInput2', 'declaredInput2'],
   * }
   * ```
   *
   * Which the minifier may translate to:
   * ```
   * {
   *   minifiedPublicInput1: 'publicInput1',
   *   minifiedDeclaredInput2: ['publicInput2', 'declaredInput2'],
   * }
   * ```
   *
   * This allows the render to re-construct the minified, public, and declared names
   * of properties.
   *
   * NOTE:
   *  - Because declared and public name are usually same we only generate the array
   *    `['public', 'declared']` format when they differ.
   *  - The reason why this API and `outputs` API is not the same is that `NgOnChanges` has
   *    inconsistent behavior in that it uses declared names rather than minified or public. For
   *    this reason `NgOnChanges` will be deprecated and removed in future version and this
   *    API will be simplified to be consistent with `output`.
   */
  inputs?: {[P in keyof T]?: string | [string, string]};

  /**
   * A map of output names.
   *
   * The format is in: `{[actualPropertyName: string]:string}`.
   *
   * Which the minifier may translate to: `{[minifiedPropertyName: string]:string}`.
   *
   * This allows the render to re-construct the minified and non-minified names
   * of properties.
   */
  outputs?: {[P in keyof T]?: string};

  /**
   * Function executed by the parent template to allow child directive to apply host bindings.
   */
  hostBindings?: HostBindingsFunction<T>;

  /**
   * Function to create instances of content queries associated with a given directive.
   */
  contentQueries?: ContentQueriesFunction<T>;

  /**
   * Defines the name that can be used in the template to assign this directive to a variable.
   *
   * See: {@link Directive.exportAs}
   */
  exportAs?: string[];

  /**
   * Template function use for rendering DOM.
   *
   * This function has following structure.
   *
   * ```
   * function Template<T>(ctx:T, creationMode: boolean) {
   *   if (creationMode) {
   *     // Contains creation mode instructions.
   *   }
   *   // Contains binding update instructions
   * }
   * ```
   *
   * Common instructions are:
   * Creation mode instructions:
   *  - `elementStart`, `elementEnd`
   *  - `text`
   *  - `container`
   *  - `listener`
   *
   * Binding update instructions:
   * - `bind`
   * - `elementAttribute`
   * - `elementProperty`
   * - `elementClass`
   * - `elementStyle`
   *
   */
  template: ComponentTemplate<T>;

  /**
   * An array of `ngContent[selector]` values that were found in the template.
   */
  ngContentSelectors?: string[];

  /**
   * Additional set of instructions specific to view query processing. This could be seen as a
   * set of instruction to be inserted into the template function.
   *
   * Query-related instructions need to be pulled out to a specific function as a timing of
   * execution is different as compared to all other instructions (after change detection hooks but
   * before view hooks).
   */
  viewQuery?: ViewQueriesFunction<T>| null;

  /**
   * A list of optional features to apply.
   *
   * See: {@link NgOnChangesFeature}, {@link ProvidersFeature}
   */
  features?: ComponentDefFeature[];

  /**
   * Defines template and style encapsulation options available for Component's {@link Component}.
   */
  encapsulation?: ViewEncapsulation;

  /**
   * Defines arbitrary developer-defined data to be stored on a renderer instance.
   * This is useful for renderers that delegate to other renderers.
   *
   * see: animation
   */
  data?: {[kind: string]: any};

  /**
   * A set of styles that the component needs to be present for component to render correctly.
   */
  styles?: string[];

  /**
   * The strategy that the default change detector uses to detect changes.
   * When set, takes effect the next time change detection is triggered.
   */
  changeDetection?: ChangeDetectionStrategy;

  /**
   * Registry of directives and components that may be found in this component's view.
   *
   * The property is either an array of `DirectiveDef`s or a function which returns the array of
   * `DirectiveDef`s. The function is necessary to be able to support forward declarations.
   */
  directives?: DirectiveTypesOrFactory | null;

  /**
   * Registry of pipes that may be found in this component's view.
   *
   * The property is either an array of `PipeDefs`s or a function which returns the array of
   * `PipeDefs`s. The function is necessary to be able to support forward declarations.
   */
  pipes?: PipeTypesOrFactory | null;

  /**
   * The set of schemas that declare elements to be allowed in the component's template.
   */
  schemas?: SchemaMetadata[] | null;
}): never {
  const type = componentDefinition.type;
  const typePrototype = type.prototype;
  const declaredInputs: {[key: string]: string} = {} as any;
  const def: Mutable<ComponentDef<any>, keyof ComponentDef<any>> = {
    type: type,
    providersResolver: null,
    consts: componentDefinition.consts,
    vars: componentDefinition.vars,
    factory: componentDefinition.factory,
    template: componentDefinition.template || null !,
    ngContentSelectors: componentDefinition.ngContentSelectors,
    hostBindings: componentDefinition.hostBindings || null,
    contentQueries: componentDefinition.contentQueries || null,
    declaredInputs: declaredInputs,
    inputs: null !,   // assigned in noSideEffects
    outputs: null !,  // assigned in noSideEffects
    exportAs: componentDefinition.exportAs || null,
    onChanges: null,
    onInit: typePrototype.ngOnInit || null,
    doCheck: typePrototype.ngDoCheck || null,
    afterContentInit: typePrototype.ngAfterContentInit || null,
    afterContentChecked: typePrototype.ngAfterContentChecked || null,
    afterViewInit: typePrototype.ngAfterViewInit || null,
    afterViewChecked: typePrototype.ngAfterViewChecked || null,
    onDestroy: typePrototype.ngOnDestroy || null,
    onPush: componentDefinition.changeDetection === ChangeDetectionStrategy.OnPush,
    directiveDefs: null !,  // assigned in noSideEffects
    pipeDefs: null !,       // assigned in noSideEffects
    selectors: componentDefinition.selectors,
    viewQuery: componentDefinition.viewQuery || null,
    features: componentDefinition.features || null,
    data: componentDefinition.data || {},
    // TODO(misko): convert ViewEncapsulation into const enum so that it can be used directly in the
    // next line. Also `None` should be 0 not 2.
    encapsulation: componentDefinition.encapsulation || ViewEncapsulation.Emulated,
    id: 'c',
    styles: componentDefinition.styles || EMPTY_ARRAY,
    _: null as never,
    setInput: null,
    schemas: componentDefinition.schemas || null,
  };
  def._ = noSideEffects(() => {
    const directiveTypes = componentDefinition.directives !;
    const feature = componentDefinition.features;
    const pipeTypes = componentDefinition.pipes !;
    def.id += _renderCompCount++;
    def.inputs = invertObject(componentDefinition.inputs, declaredInputs),
    def.outputs = invertObject(componentDefinition.outputs),
    feature && feature.forEach((fn) => fn(def));
    def.directiveDefs = directiveTypes ?
        () => (typeof directiveTypes === 'function' ? directiveTypes() : directiveTypes)
                  .map(extractDirectiveDef) :
        null;
    def.pipeDefs = pipeTypes ?
        () => (typeof pipeTypes === 'function' ? pipeTypes() : pipeTypes).map(extractPipeDef) :
        null;
  }) as never;
  return def as never;
}

/**
 * @codeGenApi
 */
export function ΔsetComponentScope(
    type: ComponentType<any>, directives: Type<any>[], pipes: Type<any>[]): void {
  const def = (type.ngComponentDef as ComponentDef<any>);
  def.directiveDefs = () => directives.map(extractDirectiveDef);
  def.pipeDefs = () => pipes.map(extractPipeDef);
}

export function extractDirectiveDef(type: DirectiveType<any>& ComponentType<any>):
    DirectiveDef<any>|ComponentDef<any> {
  const def = getComponentDef(type) || getDirectiveDef(type);
  if (ngDevMode && !def) {
    throw new Error(`'${type.name}' is neither 'ComponentType' or 'DirectiveType'.`);
  }
  return def !;
}

export function extractPipeDef(type: PipeType<any>): PipeDef<any> {
  const def = getPipeDef(type);
  if (ngDevMode && !def) {
    throw new Error(`'${type.name}' is not a 'PipeType'.`);
  }
  return def !;
}

/**
 * @codeGenApi
 */
export function ΔdefineNgModule<T>(def: {
  /** Token representing the module. Used by DI. */
  type: T;

  /** List of components to bootstrap. */
  bootstrap?: Type<any>[] | (() => Type<any>[]);

  /** List of components, directives, and pipes declared by this module. */
  declarations?: Type<any>[] | (() => Type<any>[]);

  /** List of modules or `ModuleWithProviders` imported by this module. */
  imports?: Type<any>[] | (() => Type<any>[]);

  /**
   * List of modules, `ModuleWithProviders`, components, directives, or pipes exported by this
   * module.
   */
  exports?: Type<any>[] | (() => Type<any>[]);

  /** The set of schemas that declare elements to be allowed in the NgModule. */
  schemas?: SchemaMetadata[] | null;
}): never {
  const res: NgModuleDef<T> = {
    type: def.type,
    bootstrap: def.bootstrap || EMPTY_ARRAY,
    declarations: def.declarations || EMPTY_ARRAY,
    imports: def.imports || EMPTY_ARRAY,
    exports: def.exports || EMPTY_ARRAY,
    transitiveCompileScopes: null,
    schemas: def.schemas || null,
  };
  return res as never;
}

/**
 * Adds the module metadata that is necessary to compute the module's transitive scope to an
 * existing module definition.
 *
 * Scope metadata of modules is not used in production builds, so calls to this function can be
 * marked pure to tree-shake it from the bundle, allowing for all referenced declarations
 * to become eligible for tree-shaking as well.
 *
 * @codeGenApi
 */
export function ΔsetNgModuleScope(type: any, scope: {
  /** List of components, directives, and pipes declared by this module. */
  declarations?: Type<any>[] | (() => Type<any>[]);

  /** List of modules or `ModuleWithProviders` imported by this module. */
  imports?: Type<any>[] | (() => Type<any>[]);

  /**
   * List of modules, `ModuleWithProviders`, components, directives, or pipes exported by this
   * module.
   */
  exports?: Type<any>[] | (() => Type<any>[]);
}): void {
  const ngModuleDef = getNgModuleDef(type, true);
  ngModuleDef.declarations = scope.declarations || EMPTY_ARRAY;
  ngModuleDef.imports = scope.imports || EMPTY_ARRAY;
  ngModuleDef.exports = scope.exports || EMPTY_ARRAY;
}

/**
 * Inverts an inputs or outputs lookup such that the keys, which were the
 * minified keys, are part of the values, and the values are parsed so that
 * the publicName of the property is the new key
 *
 * e.g. for
 *
 * ```
 * class Comp {
 *   @Input()
 *   propName1: string;
 *
 *   @Input('publicName2')
 *   declaredPropName2: number;
 * }
 * ```
 *
 * will be serialized as
 *
 * ```
 * {
 *   propName1: 'propName1',
 *   declaredPropName2: ['publicName2', 'declaredPropName2'],
 * }
 * ```
 *
 * which is than translated by the minifier as:
 *
 * ```
 * {
 *   minifiedPropName1: 'propName1',
 *   minifiedPropName2: ['publicName2', 'declaredPropName2'],
 * }
 * ```
 *
 * becomes: (public name => minifiedName)
 *
 * ```
 * {
 *  'propName1': 'minifiedPropName1',
 *  'publicName2': 'minifiedPropName2',
 * }
 * ```
 *
 * Optionally the function can take `secondary` which will result in: (public name => declared name)
 *
 * ```
 * {
 *  'propName1': 'propName1',
 *  'publicName2': 'declaredPropName2',
 * }
 * ```
 *

 */
function invertObject<T>(
    obj?: {[P in keyof T]?: string | [string, string]},
    secondary?: {[key: string]: string}): {[P in keyof T]: string} {
  if (obj == null) return EMPTY_OBJ as any;
  const newLookup: any = {};
  for (const minifiedKey in obj) {
    if (obj.hasOwnProperty(minifiedKey)) {
      let publicName: string|[string, string] = obj[minifiedKey] !;
      let declaredName = publicName;
      if (Array.isArray(publicName)) {
        declaredName = publicName[1];
        publicName = publicName[0];
      }
      newLookup[publicName] = minifiedKey;
      if (secondary) {
        (secondary[publicName] = declaredName as string);
      }
    }
  }
  return newLookup;
}

/**
 * Create a base definition
 *
 * # Example
 * ```ts
 * class ShouldBeInherited {
 *   static ngBaseDef = ΔdefineBase({
 *      ...
 *   })
 * }
 * ```
 *
 * @param baseDefinition The base definition parameters
 *
 * @codeGenApi
 */
export function ΔdefineBase<T>(baseDefinition: {
  /**
   * A map of input names.
   *
   * The format is in: `{[actualPropertyName: string]:(string|[string, string])}`.
   *
   * Given:
   * ```
   * class MyComponent {
   *   @Input()
   *   publicInput1: string;
   *
   *   @Input('publicInput2')
   *   declaredInput2: string;
   * }
   * ```
   *
   * is described as:
   * ```
   * {
   *   publicInput1: 'publicInput1',
   *   declaredInput2: ['declaredInput2', 'publicInput2'],
   * }
   * ```
   *
   * Which the minifier may translate to:
   * ```
   * {
   *   minifiedPublicInput1: 'publicInput1',
   *   minifiedDeclaredInput2: [ 'declaredInput2', 'publicInput2'],
   * }
   * ```
   *
   * This allows the render to re-construct the minified, public, and declared names
   * of properties.
   *
   * NOTE:
   *  - Because declared and public name are usually same we only generate the array
   *    `['declared', 'public']` format when they differ.
   *  - The reason why this API and `outputs` API is not the same is that `NgOnChanges` has
   *    inconsistent behavior in that it uses declared names rather than minified or public. For
   *    this reason `NgOnChanges` will be deprecated and removed in future version and this
   *    API will be simplified to be consistent with `outputs`.
   */
  inputs?: {[P in keyof T]?: string | [string, string]};

  /**
   * A map of output names.
   *
   * The format is in: `{[actualPropertyName: string]:string}`.
   *
   * Which the minifier may translate to: `{[minifiedPropertyName: string]:string}`.
   *
   * This allows the render to re-construct the minified and non-minified names
   * of properties.
   */
  outputs?: {[P in keyof T]?: string};
}): ΔBaseDef<T> {
  const declaredInputs: {[P in keyof T]: string} = {} as any;
  return {
    inputs: invertObject<T>(baseDefinition.inputs as any, declaredInputs),
    declaredInputs: declaredInputs,
    outputs: invertObject<T>(baseDefinition.outputs as any),
  };
}

/**
 * Create a directive definition object.
 *
 * # Example
 * ```ts
 * class MyDirective {
 *   // Generated by Angular Template Compiler
 *   // [Symbol] syntax will not be supported by TypeScript until v2.7
 *   static ngDirectiveDef = ΔdefineDirective({
 *     ...
 *   });
 * }
 * ```
 *
 * @codeGenApi
 */
export const ΔdefineDirective = ΔdefineComponent as any as<T>(directiveDefinition: {
  /**
   * Directive type, needed to configure the injector.
   */
  type: Type<T>;

  /** The selectors that will be used to match nodes to this directive. */
  selectors: CssSelectorList;

  /**
   * Factory method used to create an instance of directive.
   */
  factory: FactoryFn<T>;

  /**
   * A map of input names.
   *
   * The format is in: `{[actualPropertyName: string]:(string|[string, string])}`.
   *
   * Given:
   * ```
   * class MyComponent {
   *   @Input()
   *   publicInput1: string;
   *
   *   @Input('publicInput2')
   *   declaredInput2: string;
   * }
   * ```
   *
   * is described as:
   * ```
   * {
   *   publicInput1: 'publicInput1',
   *   declaredInput2: ['declaredInput2', 'publicInput2'],
   * }
   * ```
   *
   * Which the minifier may translate to:
   * ```
   * {
   *   minifiedPublicInput1: 'publicInput1',
   *   minifiedDeclaredInput2: [ 'publicInput2', 'declaredInput2'],
   * }
   * ```
   *
   * This allows the render to re-construct the minified, public, and declared names
   * of properties.
   *
   * NOTE:
   *  - Because declared and public name are usually same we only generate the array
   *    `['declared', 'public']` format when they differ.
   *  - The reason why this API and `outputs` API is not the same is that `NgOnChanges` has
   *    inconsistent behavior in that it uses declared names rather than minified or public. For
   *    this reason `NgOnChanges` will be deprecated and removed in future version and this
   *    API will be simplified to be consistent with `output`.
   */
  inputs?: {[P in keyof T]?: string | [string, string]};

  /**
   * A map of output names.
   *
   * The format is in: `{[actualPropertyName: string]:string}`.
   *
   * Which the minifier may translate to: `{[minifiedPropertyName: string]:string}`.
   *
   * This allows the render to re-construct the minified and non-minified names
   * of properties.
   */
  outputs?: {[P in keyof T]?: string};

  /**
   * A list of optional features to apply.
   *
   * See: {@link NgOnChangesFeature}, {@link ProvidersFeature}, {@link InheritDefinitionFeature}
   */
  features?: DirectiveDefFeature[];

  /**
   * Function executed by the parent template to allow child directive to apply host bindings.
   */
  hostBindings?: HostBindingsFunction<T>;

  /**
   * Function to create instances of content queries associated with a given directive.
   */
  contentQueries?: ContentQueriesFunction<T>;

  /**
   * Additional set of instructions specific to view query processing. This could be seen as a
   * set of instructions to be inserted into the template function.
   */
  viewQuery?: ViewQueriesFunction<T>| null;

  /**
   * Defines the name that can be used in the template to assign this directive to a variable.
   *
   * See: {@link Directive.exportAs}
   */
  exportAs?: string[];
}) => never;

/**
 * Create a pipe definition object.
 *
 * # Example
 * ```
 * class MyPipe implements PipeTransform {
 *   // Generated by Angular Template Compiler
 *   static ngPipeDef = definePipe({
 *     ...
 *   });
 * }
 * ```
 * @param pipeDef Pipe definition generated by the compiler
 *
 * @codeGenApi
 */
export function ΔdefinePipe<T>(pipeDef: {
  /** Name of the pipe. Used for matching pipes in template to pipe defs. */
  name: string,

  /** Pipe class reference. Needed to extract pipe lifecycle hooks. */
  type: Type<T>,

  /** A factory for creating a pipe instance. */
  factory: FactoryFn<T>,

  /** Whether the pipe is pure. */
  pure?: boolean
}): never {
  return (<PipeDef<T>>{
    name: pipeDef.name,
    factory: pipeDef.factory,
    pure: pipeDef.pure !== false,
    onDestroy: pipeDef.type.prototype.ngOnDestroy || null
  }) as never;
}

/**
 * The following getter methods retrieve the definition form the type. Currently the retrieval
 * honors inheritance, but in the future we may change the rule to require that definitions are
 * explicit. This would require some sort of migration strategy.
 */

export function getComponentDef<T>(type: any): ComponentDef<T>|null {
  return (type as any)[NG_COMPONENT_DEF] || null;
}

export function getDirectiveDef<T>(type: any): DirectiveDef<T>|null {
  return (type as any)[NG_DIRECTIVE_DEF] || null;
}

export function getPipeDef<T>(type: any): PipeDef<T>|null {
  return (type as any)[NG_PIPE_DEF] || null;
}

export function getNgModuleDef<T>(type: any, throwNotFound: true): NgModuleDef<T>;
export function getNgModuleDef<T>(type: any): NgModuleDef<T>|null;
export function getNgModuleDef<T>(type: any, throwNotFound?: boolean): NgModuleDef<T>|null {
  const ngModuleDef = (type as any)[NG_MODULE_DEF] || null;
  if (!ngModuleDef && throwNotFound === true) {
    throw new Error(`Type ${stringify(type)} does not have 'ngModuleDef' property.`);
  }
  return ngModuleDef;
}
