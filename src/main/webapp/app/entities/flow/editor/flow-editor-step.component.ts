import { afterNextRender, ChangeDetectorRef, Component, ElementRef, EventEmitter, inject, Injectable, Injector, Input, OnChanges, OnDestroy, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { CodemirrorComponent, CodemirrorModule } from '@ctrl/ngx-codemirror';
import { Components } from 'app/shared/camel/component-type';
import { CatalogueEntry, EndpointRole, NO_MATCH, closestFirst, essentialsFirst, matchRank, roleMismatch, searchCatalogue } from 'app/shared/camel/catalogue';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_OPTION,
  OptionSchema,
  PathPart,
  ValueField,
  groupOptions,
  pathLabel,
  pathRule,
  requiredOptions,
  splitHttpUrl,
  suggestedOptions,
  valueChoicesOf,
  valueFieldOf,
} from 'app/shared/camel/endpoint';
import { insertVariable, unknownVariables, unknownVariablesMessage } from 'app/shared/camel/variables';
import { IStep, StepType } from 'app/shared/model/step.model';
import { IMessage } from 'app/shared/model/message.model';
import { Connection } from 'app/shared/model/connection.model';
import { ThemeService } from 'app/core/theme';
import { VariableKeysService } from 'app/entities/environment-variables/variable-keys.service';
import { isRouteStep, missingRouteFields } from './route-step';
import { Subscription } from 'rxjs';
import { FlowService } from '../flow.service';
import { ScriptLanguageInfo, ScriptTrial, isStarterScript, scriptHint, starterScript } from './script-flow';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/groovy/groovy';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/python/python';
import 'codemirror/mode/xml/xml';
import 'codemirror/addon/display/placeholder';
import 'codemirror/addon/edit/closetag';

@Injectable()
export class StepEditorRegistry {
  readonly editors: FlowEditorStepComponent[] = [];

  refresh(): void {
    this.editors.forEach(editor => editor.refreshView());
  }
}

@Component({
  selector: 'jhi-flow-editor-step',
  templateUrl: './flow-editor-step.component.html',
  styleUrl: './flow-editor-step.component.scss',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NgbModule, FontAwesomeModule, NgSelectModule, PopoverModule, CodemirrorModule],
})
export class FlowEditorStepComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) step: IStep;
  @Input({ required: true }) index: number;
  @Input({ required: true }) stepForm: FormGroup;
  @Input() activeEditor: string;
  /** On the visual designer's canvas, Steps are added there instead of through this form. */
  @Input() onCanvas = false;
  /** On the canvas, the kind of the Router being edited; it is shown as its component and can't be changed here. */
  @Input() routerTitle?: string;
  /** On the canvas, whether the Flow keeps a valid shape without this Step; the canvas decides which Steps can go. */
  @Input() deletable = false;
  @Input() formSubmitted = false;

  @Input() sourceComponentsNames: Array<any> = [];
  @Input() sinkComponentsNames: Array<any> = [];
  @Input() actionComponentsNames: Array<any> = [];
  @Input() languageComponentsNames: readonly ScriptLanguageInfo[] = [];

  @Input() messages: IMessage[] = [];
  @Input() connections: Connection[] = [];
  @Input() messageCreated = false;
  @Input() connectionCreated = false;

  @Input() uriPlaceholder: string;
  /** The path an Error Handler gets automatically while the user leaves it to the Flow, shown as a hint. */
  @Input() autoPath?: string;
  /** Whether this Step's add menu offers a Log Step for the result: the last Script of a Script Flow without one. */
  @Input() canAddLog = false;
  @Input() uriPopoverMessage: string;
  @Input() uriList: IStep[] = [];
  @Input() componentOptions: Array<any> = [];
  @Input() stepOptions: Array<{ key?: string; value?: string }> = [];
  @Input() selectedOptions: Array<any> = [];
  @Input() componentTypeCamelLink: string;
  @Input() enableMessage = false;
  @Input() enableConnection = false;
  @Input() filterConnection: Connection[] = [];
  @Input() connectionType: string;
  @Input() errorHandlerPopoverMessage: string;
  @Input() optionsPopoverMessage: string;
  @Input() customOptions: Array<any> = [];

  @Output() removeStep = new EventEmitter<{ step: IStep; index: number }>();
  @Output() addStep = new EventEmitter<{ step: IStep; index: number; stepType?: StepType }>();
  @Output() addConnection = new EventEmitter<{ step: IStep; index: number }>();
  @Output() componentTypeChange = new EventEmitter<{ step: IStep; index: number; componentType: any }>();
  /** The Component changed between HTTP and HTTPS to match a pasted URL, keeping the path and Options. */
  @Output() schemeChange = new EventEmitter<{ step: IStep; index: number }>();
  /** Opens the large Route editor on the Step's form, which holds its Route as `route`, `routeName` and `routeContent`. */
  @Output() createOrEditRoute = new EventEmitter<{ step: IStep; form: FormGroup }>();
  @Output() createOrEditMessage = new EventEmitter<{ step: IStep; control: AbstractControl }>();
  @Output() createOrEditConnection = new EventEmitter<{ step: IStep; connectionType: string; control: AbstractControl }>();

  readonly themeService = inject(ThemeService);
  private readonly flowService = inject(FlowService);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  /** The body "Try it" runs the script on; empty sends none. */
  readonly sampleBody = new FormControl('', { nonNullable: true });
  /** Whether the user asked for the sample body; until then "Try it" runs on an empty body. */
  sampleBodyOpen = false;
  /** What the last "Try it" gave, until the language changes. */
  trial: ScriptTrial | null = null;
  trying = false;
  private trialSubscription?: Subscription;
  private scriptOptionsKey = '';
  private scriptOptionsCache: Record<string, unknown> | null = null;
  private pathOptionsKey = '';
  private pathOptionsCache: Record<string, unknown> | null = null;
  private routeOptionsTheme = '';
  private routeOptionsCache: Record<string, unknown> | null = null;

  @ViewChild('scriptEditor')
  set scriptEditor(editor: CodemirrorComponent | undefined) {
    const codeMirror = editor?.codeMirror;
    if (!codeMirror) {
      return;
    }
    setTimeout(() => {
      codeMirror.refresh();
      codeMirror.scrollTo(0, 0);
      if (!codeMirror.getValue()) {
        codeMirror.setCursor({ line: 0, ch: 0 });
      }
    });
  }

  hoveredOption: any;
  modalRef: NgbModalRef | null;

  private readonly injector = inject(Injector);

  constructor(
    private modalService: NgbModal,
    private components: Components,
    private cdr: ChangeDetectorRef,
    private stepEditorRegistry: StepEditorRegistry,
  ) {
    this.stepEditorRegistry.editors.push(this);
    inject(VariableKeysService)
      .keys()
      .pipe(takeUntilDestroyed())
      .subscribe(keys => {
        this.variableKeys = keys;
        this.cdr.markForCheck();
      });
  }

  /** The keys of the Variables a Path or Option can refer to; null while unknown, so nothing is reported as missing. */
  variableKeys: string[] | null = null;
  /** What is typed in the Insert Variable menu to narrow its keys. */
  variableFilter = '';

  get filteredVariableKeys(): string[] {
    const filter = this.variableFilter.trim().toLowerCase();
    return (this.variableKeys ?? []).filter(key => key.toLowerCase().includes(filter));
  }

  /** Puts a reference to the Variable in a Path or Option value at the cursor, and leaves the cursor after it. */
  insertVariableInto(control: AbstractControl | null | undefined, input: HTMLInputElement | null, key: string): void {
    if (!control) {
      return;
    }
    const { text, cursor } = insertVariable(`${control.value ?? ''}`, key, input?.selectionStart ?? undefined);
    control.setValue(text);
    control.markAsDirty();
    this.variableFilter = '';
    setTimeout(() => {
      input?.focus();
      input?.setSelectionRange(cursor, cursor);
    });
  }

  /**
   * Puts a reference to the Variable in an Option's value, at the cursor of its text field. A switch, list or number
   * field has no cursor, so the reference becomes its value, which turns it into a text field.
   */
  insertVariableIntoOption(idx: number, key: string): void {
    const field = this.host.nativeElement.querySelector(`#field_options-value-${this.index}-${idx}`);
    const input = field instanceof HTMLInputElement && field.type === 'text' && field.inputMode !== 'numeric' ? field : null;
    const control = this.optionGroup(idx)?.get('value');
    if (!input) {
      control?.setValue('');
    }
    this.insertVariableInto(control, input, key);
  }

  /** What the Step says about the Variables its Path and Options refer to that don't exist, or nothing. */
  get unknownVariablesWarning(): string | undefined {
    if (!this.variableKeys) {
      return undefined;
    }
    const values = ((this.stepForm.get('options') as FormArray)?.controls ?? []).map(option => `${option.get('value')?.value ?? ''}`);
    const unknown = unknownVariables([`${this.stepForm.get('uri')?.value ?? ''}`, ...values], this.variableKeys);
    return unknown.length ? unknownVariablesMessage(unknown) : undefined;
  }

  private choicesCache?: { options: unknown[]; length: number; role: EndpointRole; choices: OptionSchema[] };
  private pathPartsCache?: { syntax: string; options: unknown[]; parts: PathPart[] };
  private componentChoicesCache?: { names: unknown[]; role: EndpointRole; search: string; choices: ComponentChoice[] };

  /** What is typed in the component list; while searching it also shows the components this Step can't use. */
  componentSearch = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['componentOptions'] && this.componentOptions?.length) {
      this.addSuggestedOptions();
    }
  }

  /** A Source receives messages; every other Step sends them. */
  get role(): EndpointRole {
    return this.stepType === 'SOURCE' ? 'consumer' : 'producer';
  }

  /** The Options this Step can set, under Common, Advanced and Security. Cached so the key list keeps its items. */
  get optionChoices(): OptionSchema[] {
    const options = this.componentOptions ?? [];
    const cache = this.choicesCache;
    if (!cache || cache.options !== options || cache.length !== options.length || cache.role !== this.role) {
      this.choicesCache = { options, length: options.length, role: this.role, choices: groupOptions(options, this.role) };
    }
    return this.choicesCache!.choices;
  }

  /** The Component's path parts, from its syntax, for the Path field's hint. */
  get pathParts(): PathPart[] {
    const syntax = this.uriPlaceholder ?? '';
    const options = this.componentOptions ?? [];
    if (this.pathPartsCache?.syntax !== syntax || this.pathPartsCache.options !== options) {
      this.pathPartsCache = { syntax, options, parts: syntax ? pathRule(syntax, options).parts : [] };
    }
    return this.pathPartsCache.parts;
  }

  /** What the Path field is called for this Component, such as Directory Name for File. */
  get pathFieldLabel(): string {
    return pathLabel(this.pathParts);
  }

  /**
   * The components this Step can use, with the catalogue's title and description; while searching, also the ones
   * it can't use, disabled with the reason, so every component Camel offers can be found.
   */
  get componentChoices(): ComponentChoice[] {
    const names = this.stepType === 'SOURCE' ? this.sourceComponentsNames : this.stepType === 'ACTION' ? this.actionComponentsNames : this.sinkComponentsNames;
    const cache = this.componentChoicesCache;
    if (cache && cache.names === names && cache.role === this.role && cache.search === this.componentSearch) {
      return cache.choices;
    }
    const usable = new Set<string>(names ?? []);
    const usableChoices = [...usable].map(name => this.componentChoice(this.catalogueEntry(name)));
    // Actions list Assimbly's own Actions first, as the step picker does.
    let choices: ComponentChoice[] = this.stepType === 'ACTION' ? essentialsFirst(usableChoices) : usableChoices;
    if (this.componentSearch.trim()) {
      const others = this.components.types.filter(type => !usable.has(type.name));
      searchCatalogue(others, this.componentSearch).forEach(entry =>
        choices.push(this.componentChoice(entry, roleMismatch(entry, this.role) ?? `${entry.title ?? entry.name} isn't available for this Step.`)),
      );
      // ng-select only filters, so the closest match is put on top here; at equal closeness usable components stay first.
      choices = closestFirst(choices, this.componentSearch);
    }
    this.componentChoicesCache = { names, role: this.role, search: this.componentSearch, choices };
    return choices;
  }

  readonly matchesComponent = (term: string, item: ComponentChoice): boolean => matchRank(item, term) < NO_MATCH;

  /**
   * Searching puts the closest match on top, but ng-select keeps its scroll position when its items change, which
   * leaves that match out of sight. Once the new order is rendered, it is marked and scrolled into view.
   */
  onComponentSearch(term: string, select: NgSelectComponent): void {
    this.componentSearch = term;
    afterNextRender(
      () => {
        const closest = select.itemsList.filteredItems.find(item => !item.disabled);
        if (closest) {
          select.itemsList.markItem(closest);
          select.dropdownPanel()?.scrollTo(closest);
          select.detectChanges();
        }
      },
      { injector: this.injector },
    );
  }

  /** Compares an enum value with the empty "Default" entry, which a new row holds as null and a loaded row as ''. */
  readonly sameValue = (a: unknown, b: unknown): boolean => (a ?? '') === (b ?? '');

  private catalogueEntry(name: string): CatalogueEntry {
    return this.components.types.find(type => type.name === name) ?? { name };
  }

  private componentChoice(entry: CatalogueEntry, reason?: string): ComponentChoice {
    return { ...entry, label: entry.title ?? entry.name, reason, disabled: !!reason };
  }

  optionSchema(idx: number): OptionSchema | undefined {
    const key = this.optionKey(idx);
    return key ? (this.componentOptions ?? []).find(option => option.name === key) : undefined;
  }

  private optionKey(idx: number): string | undefined {
    return (this.stepForm.get('options') as FormArray)?.at(idx)?.get('key')?.value ?? undefined;
  }

  /** The field for an Option's value; a placeholder such as `{{flag}}` in a boolean Option keeps a text field. */
  valueField(idx: number): ValueField {
    const field = valueFieldOf(this.optionSchema(idx) ?? { name: this.optionKey(idx) });
    const value = this.optionValue(idx);
    return field === 'switch' && value !== '' && value !== 'true' && value !== 'false' ? 'text' : field;
  }

  hasValue(idx: number): boolean {
    return this.optionValue(idx) !== '';
  }

  /** Leaves the Option unset, so the Component's default applies. */
  clearValue(idx: number): void {
    const control = (this.stepForm.get('options') as FormArray).at(idx).get('value')!;
    control.setValue('');
    control.markAsDirty();
  }

  isRequiredOption(idx: number): boolean {
    return !!this.optionSchema(idx)?.required;
  }

  switchOn(idx: number): boolean {
    const value = this.optionValue(idx);
    return value === '' ? this.optionSchema(idx)?.defaultValue === true : value === 'true';
  }

  setSwitch(idx: number, on: boolean): void {
    const control = (this.stepForm.get('options') as FormArray).at(idx).get('value')!;
    control.setValue(String(on));
    control.markAsDirty();
  }

  /** The enum values, plus a value typed earlier that the catalogue doesn't list, such as a placeholder. */
  choicesOf(idx: number): readonly string[] {
    const values = valueChoicesOf(this.optionSchema(idx) ?? { name: this.optionKey(idx) });
    const value = this.optionValue(idx);
    return value && !values.includes(value) ? [...values, value] : values;
  }

  /** The required Options that have no value yet. They don't block: a Connection may supply them. */
  get missingRequiredOptions(): string[] {
    const formOptions = (this.stepForm.get('options') as FormArray)?.controls ?? [];
    const filled = new Set(formOptions.filter(option => `${option.get('value')?.value ?? ''}`.trim()).map(option => option.get('key')?.value));
    return requiredOptions(this.componentOptions ?? [], this.role)
      .filter(name => !filled.has(name))
      .map(name => this.componentOptions.find(option => option.name === name)?.displayName ?? name);
  }

  optionValue(idx: number): string {
    return `${(this.stepForm.get('options') as FormArray)?.at(idx)?.get('value')?.value ?? ''}`;
  }

  /**
   * Adds an empty row for each suggested Option of a Step that has no Options yet: the required ones, and for a small
   * Component all of its Common Options. A saved Step's own Options are filled in after its schema arrives, so they
   * are left alone. Rows left empty aren't saved.
   */
  private addSuggestedOptions(): void {
    const formOptions = this.stepForm?.get('options') as FormArray | null;
    if (!formOptions || this.step?.options) {
      return;
    }
    const present = new Set(formOptions.controls.map(option => option.get('key')?.value));
    suggestedOptions(this.componentOptions, this.role)
      .filter(name => !present.has(name))
      .forEach(name => {
        const emptyRow = formOptions.controls.findIndex(option => !option.get('key')?.value && !option.get('value')?.value);
        if (emptyRow < 0) {
          this.addOption();
        }
        const row = emptyRow < 0 ? formOptions.length - 1 : emptyRow;
        formOptions.at(row).get('key')!.setValue(name);
        if (this.stepOptions[row]) {
          this.stepOptions[row].key = name;
        }
        this.fillDefaultLanguage(row);
      });
  }

  /** A `language` Option starts on Simple, so the language is in plain sight. */
  private fillDefaultLanguage(idx: number): void {
    const value = (this.stepForm.get('options') as FormArray).at(idx).get('value')!;
    if (this.optionKey(idx) === LANGUAGE_OPTION && !value.value) {
      value.setValue(DEFAULT_LANGUAGE);
    }
  }

  ngOnDestroy(): void {
    this.trialSubscription?.unsubscribe();
    const index = this.stepEditorRegistry.editors.indexOf(this);
    if (index >= 0) {
      this.stepEditorRegistry.editors.splice(index, 1);
    }
  }

  get stepType(): string {
    return this.stepForm?.get('stepType')?.value;
  }

  get componentType(): string {
    return this.stepForm?.get('componentType')?.value;
  }

  get uriValue(): string {
    return this.stepForm?.get('uri')?.value;
  }

  get messageValue(): any {
    return this.stepForm?.get('message')?.value;
  }

  get connectionValue(): any {
    return this.stepForm?.get('connection')?.value;
  }

  get connectionDisabled(): boolean {
    return !!this.stepForm?.get('connection')?.disabled;
  }

  get messageControl(): AbstractControl {
    return this.stepForm.get('message');
  }

  get connectionControl(): AbstractControl {
    return this.stepForm.get('connection');
  }

  get componentTypeErrors(): any {
    return this.stepForm?.get('componentType')?.errors;
  }

  get uriErrors(): any {
    return this.stepForm?.get('uri')?.errors;
  }

  /** A Route, and the Error handler of a Route Flow, have no Component to filter on, so they offer every Connection. */
  get connectionChoices(): Connection[] {
    return this.isRouteStep ? this.connections : this.filterConnection;
  }

  /** A Step whose Component needs a Connection gets the Connection field by itself; only Route and Script Steps add one. */
  get canAddConnection(): boolean {
    return !this.isComponentStep;
  }

  get canAddAction(): boolean {
    return !this.onCanvas && (this.stepType === 'ACTION' || (this.stepType === 'SOURCE' && this.activeEditor === 'flow'));
  }

  get canAddScript(): boolean {
    return this.stepType === 'SCRIPT' || (this.stepType === 'SOURCE' && this.activeEditor === 'script');
  }

  get hasAddMenu(): boolean {
    return (
      (this.canAddConnection && !this.enableConnection) || this.canAddAction || this.canAddScript || this.canAddLog || this.stepType === 'ROUTE'
    );
  }

  get canRemoveStep(): boolean {
    if (this.onCanvas) {
      return this.deletable;
    }
    return (
      this.stepType === 'ACTION' ||
      this.stepType === 'ROUTER' ||
      this.stepType === 'SCRIPT' ||
      this.stepType === 'ROUTE' ||
      (this.stepType === 'SINK' && this.activeEditor === 'script')
    );
  }

  /** A Route, or the Error handler of a Route Flow: a name and a Camel route in XML. */
  get isRouteStep(): boolean {
    return isRouteStep(this.stepType, this.activeEditor);
  }

  get routeStepLabel(): string {
    return this.stepType === 'ERROR' ? 'Error handler' : 'Route';
  }

  get routeNameMissing(): boolean {
    return this.formSubmitted && this.missingRouteFields.name;
  }

  get routeContentMissing(): boolean {
    return this.formSubmitted && this.missingRouteFields.content;
  }

  private get missingRouteFields(): { name: boolean; content: boolean } {
    return missingRouteFields(this.stepType, { name: this.stepForm?.get('routeName')?.value, content: this.stepForm?.get('routeContent')?.value });
  }

  get isComponentStep(): boolean {
    return (
      this.stepType === 'ACTION' ||
      this.stepType === 'ROUTER' ||
      this.stepType === 'SOURCE' ||
      this.stepType === 'SINK' ||
      (this.stepType === 'ERROR' && (this.activeEditor === 'flow' || this.activeEditor === 'script'))
    );
  }

  optionDefaultValue(idx: number): string {
    return (this.stepForm.get('options') as FormArray)?.at(idx)?.get('defaultValue')?.value ?? '';
  }

  onRemoveStep(): void {
    this.removeStep.emit({ step: this.step, index: this.index });
  }

  onAddStep(): void {
    this.addStep.emit({ step: this.step, index: this.index });
  }

  onAddLog(): void {
    this.addStep.emit({ step: this.step, index: this.index, stepType: StepType.SINK });
  }

  onAddConnection(): void {
    this.addConnection.emit({ step: this.step, index: this.index });
  }

  onComponentTypeChange(componentType: any): void {
    this.componentTypeChange.emit({ step: this.step, index: this.index, componentType });
  }

  /**
   * A full URL in an HTTP(S) Step, such as one pasted from a browser, becomes the address without its scheme, on the
   * Component the scheme names; the path and Options stay, as HTTP and HTTPS take the same ones.
   */
  normalizeHttpUrl(): void {
    const split = splitHttpUrl(this.componentType, this.uriValue);
    if (!split) {
      return;
    }
    this.stepForm.get('uri')?.setValue(split.uri);
    if (split.componentType !== this.componentType) {
      this.stepForm.get('componentType')?.setValue(split.componentType);
      this.step.componentType = split.componentType;
      this.schemeChange.emit({ step: this.step, index: this.index });
    }
  }

  /** How a script in the chosen language reads the message. */
  get scriptHint(): string {
    return scriptHint(this.componentType);
  }

  /** Another language replaces the script while it is still empty or a starter; a script the user wrote stays. */
  onScriptLanguageChange(language: string | undefined): void {
    const script = this.stepForm.get('uri');
    if (script && isStarterScript(script.value)) {
      script.setValue(starterScript(language));
    }
    this.trialSubscription?.unsubscribe();
    this.trial = null;
    this.trying = false;
  }

  /** The sample body shows once asked for, and stays while it holds one. */
  get showsSampleBody(): boolean {
    return this.sampleBodyOpen || this.sampleBody.value !== '';
  }

  /** The new body the last "Try it" gave; null when it failed or left the body empty. */
  get trialBody(): string | null {
    return this.trial?.ok ? (this.trial.body ?? null) : null;
  }

  /** The error the last "Try it" gave; null when it ran. */
  get trialError(): string | null {
    return this.trial && !this.trial.ok ? (this.trial.error ?? '') : null;
  }

  /** Runs the script once on the sample body in the runtime and shows the new body or the error, without starting the Flow. */
  tryScript(): void {
    this.trialSubscription?.unsubscribe();
    this.trying = true;
    this.trialSubscription = this.flowService.tryScript(this.componentType ?? '', this.uriValue ?? '', this.sampleBody.value).subscribe(trial => {
      this.trial = trial;
      this.trying = false;
      this.cdr.markForCheck();
    });
  }

  onCreateOrEditRoute(): void {
    this.createOrEditRoute.emit({ step: this.step, form: this.stepForm });
  }

  onCreateOrEditMessage(): void {
    this.createOrEditMessage.emit({ step: this.step, control: this.messageControl });
  }

  onCreateOrEditConnection(): void {
    this.createOrEditConnection.emit({
      step: this.step,
      connectionType: this.connectionType,
      control: this.connectionControl,
    });
  }

  refreshCodeMirror(editor: { codeMirror?: { refresh: () => void } }): void {
    const codeMirror = editor?.codeMirror;
    if (!codeMirror) {
      return;
    }
    const refresh = () => codeMirror.refresh();
    requestAnimationFrame(() => {
      refresh();
      setTimeout(refresh);
    });
  }

  openComponentDocs(): void {
    if (this.componentTypeCamelLink) {
      window.open(this.componentTypeCamelLink, '_blank', 'noopener,noreferrer');
    }
  }

  scriptEditorOptions(componentType: string): Record<string, unknown> {
    const theme = this.themeService.editorTheme();
    const key = `${componentType}|${theme}`;
    if (this.scriptOptionsCache && this.scriptOptionsKey === key) {
      return this.scriptOptionsCache;
    }
    this.scriptOptionsKey = key;
    this.scriptOptionsCache = {
      lineNumbers: true,
      gutters: ['CodeMirror-linenumbers'],
      lineWrapping: true,
      theme,
      mode: this.scriptEditorMode(componentType),
    };
    return this.scriptOptionsCache;
  }

  routeEditorOptions(): Record<string, unknown> {
    const theme = this.themeService.editorTheme();
    if (this.routeOptionsCache && this.routeOptionsTheme === theme) {
      return this.routeOptionsCache;
    }
    this.routeOptionsTheme = theme;
    this.routeOptionsCache = {
      lineNumbers: true,
      gutters: ['CodeMirror-linenumbers'],
      viewportMargin: Infinity,
      theme,
      mode: 'xml',
      autoCloseTags: true,
    };
    return this.routeOptionsCache;
  }

  pathEditorOptions(): Record<string, unknown> {
    const theme = this.themeService.editorTheme();
    const placeholder = this.uriPlaceholder ?? '';
    const key = `${theme}|${placeholder}`;
    if (this.pathOptionsCache && this.pathOptionsKey === key) {
      return this.pathOptionsCache;
    }
    this.pathOptionsKey = key;
    this.pathOptionsCache = {
      lineNumbers: true,
      gutters: ['CodeMirror-linenumbers'],
      lineWrapping: true,
      theme,
      mode: 'text',
      placeholder,
    };
    return this.pathOptionsCache;
  }

  private scriptEditorMode(componentType: string): string {
    switch ((componentType || '').toLowerCase()) {
      case 'javascript':
      case 'datasonnet':
        return 'javascript';
      case 'groovy':
      case 'jactl':
        return 'text/x-groovy';
      case 'java':
        return 'text/x-java';
      case 'python':
        return 'text/x-python';
      case 'xslt':
        return 'application/xml';
      default:
        return 'text';
    }
  }

  openModal(templateRef: TemplateRef<any>): void {
    this.modalRef = this.modalService.open(templateRef);
  }

  openPathModal(templateRef: TemplateRef<any>): void {
    this.modalRef = this.modalService.open(templateRef, { size: 'xl' });
  }

  /**
   * Whether the Step's Component doesn't read a path, such as Set body: its catalogue syntax is empty. Its Path field
   * then stays in place, read-only, so every Step has the same fields; while it holds a value it stays editable.
   */
  get pathUnused(): boolean {
    return this.uriPlaceholder === '' && !this.stepForm.get('uri')?.value && !this.autoPath;
  }

  /** The Component's name as the component list shows it. */
  get componentLabel(): string {
    const type = this.componentType ?? '';
    return this.catalogueEntry(type).title ?? type;
  }

  /** The row of the Option whose value is open in the larger editor. */
  editingOption = -1;

  openOptionValueModal(idx: number, templateRef: TemplateRef<any>): void {
    this.editingOption = idx;
    this.openPathModal(templateRef);
    // A value typed in the larger editor only reaches the form, not the row's own field bound to the same control;
    // setting it again once the editor closes shows it in the row too.
    this.modalRef?.hidden.subscribe(() => {
      const value = this.optionGroup(idx)?.get('value');
      value?.setValue(value.value);
      this.cdr.markForCheck();
    });
  }

  optionGroup(idx: number): FormGroup | null {
    return idx >= 0 ? ((this.stepForm.get('options') as FormArray)?.at(idx) as FormGroup) ?? null : null;
  }

  optionTitle(idx: number): string {
    const schema = this.optionSchema(idx);
    return schema?.displayName ?? schema?.name ?? this.optionGroup(idx)?.get('key')?.value ?? 'Option';
  }

  /** The language a Step's expression Options are written in, from its own `language` Option, for the editor's highlighting. */
  get optionLanguage(): string {
    const row = ((this.stepForm.get('options') as FormArray)?.controls ?? []).find(option => option.get('key')?.value === 'language');
    return `${row?.get('value')?.value || 'simple'}`;
  }

  openFullScreenModal(templateRef: TemplateRef<any>): void {
    this.modalRef = this.modalService.open(templateRef, { windowClass: 'fullscreen-modal' });
  }

  cancelModal(): void {
    this.modalRef?.dismiss();
    this.modalRef = null;
  }

  addOption(): void {
    (this.stepForm.get('options') as FormArray).push(this.initializeOption());
    this.stepOptions.push({ key: undefined, value: undefined });
  }

  removeOption(option: { key?: string; value?: string }): void {
    const optionIndex = this.stepOptions.indexOf(option);
    const formOptions = this.stepForm.get('options') as FormArray;

    formOptions.removeAt(optionIndex);
    formOptions.updateValueAndValidity();

    this.stepOptions.splice(optionIndex, 1);
    this.selectedOptions?.splice(optionIndex, 1);
  }

  changeOptionSelection(selectedOption, optionIndex: number): void {
    let defaultValue;
    const optionName = selectedOption?.name ?? selectedOption;
    const componentOption = (this.componentOptions || []).filter(option => option.name === optionName);

    if (componentOption[0]) {
      defaultValue = componentOption[0].defaultValue;
    } else {
      const componentType = (this.step.componentType || '').toLowerCase();
      const camelComponentType = this.components.getCamelComponentType(componentType);

      this.componentOptions.push({
        name: optionName,
        displayName: optionName,
        description: 'Custom option',
        group: 'custom',
        type: 'string',
        componentType: camelComponentType,
      });

      this.customOptions.push({
        name: optionName,
        displayName: optionName,
        description: 'Custom option',
        group: 'custom',
        type: 'string',
        componentType: camelComponentType,
      });
    }

    const formOptions = this.stepForm.get('options') as FormArray;

    if (defaultValue) {
      (formOptions.at(optionIndex) as FormGroup).controls.defaultValue.patchValue('Default Value: ' + defaultValue);
    } else {
      (formOptions.at(optionIndex) as FormGroup).controls.defaultValue.patchValue('');
    }
    this.fillDefaultLanguage(optionIndex);
  }

  addOptionTag = (name): any => {
    return { name, displayName: name, description: 'Custom option', group: 'custom', type: 'string', componentType: 'file' };
  };

  onOptionHover(item: any): void {
    this.hoveredOption = item;
    this.cdr.detectChanges();
  }

  clearOptionHover(): void {
    this.hoveredOption = null;
    this.cdr.detectChanges();
  }

  refreshView(): void {
    this.cdr.detectChanges();
  }

  private initializeOption(): FormGroup {
    return new FormGroup({
      key: new FormControl(null),
      value: new FormControl(null),
      defaultValue: new FormControl(''),
    });
  }
}

/** A component in the Step editor's component list. */
interface ComponentChoice extends CatalogueEntry {
  label: string;
  /** Why this Step can't use it; such a component is shown disabled. */
  reason?: string;
  disabled: boolean;
}
