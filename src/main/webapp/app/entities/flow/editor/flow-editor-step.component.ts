import { ChangeDetectorRef, Component, EventEmitter, inject, Injectable, Input, OnDestroy, Output, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgSelectModule } from '@ng-select/ng-select';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { CodemirrorComponent, CodemirrorModule } from '@ctrl/ngx-codemirror';
import { Components } from 'app/shared/camel/component-type';
import { IStep } from 'app/shared/model/step.model';
import { IMessage } from 'app/shared/model/message.model';
import { Route } from 'app/shared/model/route.model';
import { Connection } from 'app/shared/model/connection.model';
import { ThemeService } from 'app/core/theme';

import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/groovy/groovy';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/python/python';
import 'codemirror/mode/xml/xml';

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
  imports: [CommonModule, ReactiveFormsModule, NgbModule, FontAwesomeModule, NgSelectModule, PopoverModule, CodemirrorModule],
})
export class FlowEditorStepComponent implements OnDestroy {
  @Input({ required: true }) step: IStep;
  @Input({ required: true }) index: number;
  @Input({ required: true }) stepForm: FormGroup;
  @Input() activeEditor: string;
  @Input() formSubmitted = false;

  @Input() sourceComponentsNames: Array<any> = [];
  @Input() sinkComponentsNames: Array<any> = [];
  @Input() actionComponentsNames: Array<any> = [];
  @Input() languageComponentsNames: Array<any> = [];

  @Input() routes: Route[] = [];
  @Input() messages: IMessage[] = [];
  @Input() connections: Connection[] = [];
  @Input() routeCreated = false;
  @Input() messageCreated = false;
  @Input() connectionCreated = false;

  @Input() uriPlaceholder: string;
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
  @Output() addStep = new EventEmitter<{ step: IStep; index: number }>();
  @Output() addConnection = new EventEmitter<{ step: IStep; index: number }>();
  @Output() componentTypeChange = new EventEmitter<{ step: IStep; index: number; componentType: any }>();
  @Output() createOrEditRoute = new EventEmitter<{ step: IStep; control: AbstractControl }>();
  @Output() createOrEditMessage = new EventEmitter<{ step: IStep; control: AbstractControl }>();
  @Output() createOrEditConnection = new EventEmitter<{ step: IStep; connectionType: string; control: AbstractControl }>();

  readonly themeService = inject(ThemeService);
  private scriptOptionsKey = '';
  private scriptOptionsCache: Record<string, unknown> | null = null;

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

  constructor(
    private modalService: NgbModal,
    private components: Components,
    private cdr: ChangeDetectorRef,
    private stepEditorRegistry: StepEditorRegistry,
  ) {
    this.stepEditorRegistry.editors.push(this);
  }

  ngOnDestroy(): void {
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

  get routeValue(): any {
    return this.stepForm?.get('route')?.value;
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

  get routeControl(): AbstractControl {
    return this.stepForm.get('route');
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

  get canRemoveStep(): boolean {
    return this.stepType === 'ACTION' || this.stepType === 'ROUTER' || this.stepType === 'SCRIPT' || this.stepType === 'ROUTE';
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

  onAddConnection(): void {
    this.addConnection.emit({ step: this.step, index: this.index });
  }

  onComponentTypeChange(componentType: any): void {
    this.componentTypeChange.emit({ step: this.step, index: this.index, componentType });
  }

  onCreateOrEditRoute(): void {
    this.createOrEditRoute.emit({ step: this.step, control: this.routeControl });
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

  private scriptEditorMode(componentType: string): string {
    switch ((componentType || '').toLowerCase()) {
      case 'javascript':
        return 'javascript';
      case 'groovy':
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
