## @theme-kit/next

> Generated from `packages/next/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `ThemeProvider<T extends ThemeDefinition<string>>(__namedParameters): Promise<Element>`
**Returns** `Promise<Element>`

---


### `ThemeScope(__namedParameters): Element`
**Returns** `Element`

---


### `ThemeScrollbar(props): null`
ThemeScrollbar — overlay only.

Creates the custom scrollbar overlay.

Lifecycle:
  mount  → create overlay → measure → attach listeners
  paint  → add tk-scrollbar-ready
  destroy → remove overlay

Props are organized into three optional groups — `behavior`, `appearance`
and `icons` — but every option is also accepted as a flat, top-level prop
(flat props win over the grouped ones).

  <ThemeScrollbar
    behavior={{ autoHide: true, smooth: true }}
    appearance={{ thickness: 8, radius: 999 }}
    icons={{ up: <ArrowUpIcon />, down: <ArrowDownIcon /> }}
  />

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `props` | `ThemeScrollbarProps` | — |

**Returns** `null`

---

## Interfaces

### `ThemeProviderBodyProps`

**Extends** `Omit<HTMLAttributes<HTMLBodyElement>, "children" | "className" | "style">`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `about` (optional) | `string` | — |
| `accessKey` (optional) | `string` | — |
| `aria-activedescendant` (optional) | `string` | Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. |
| `aria-atomic` (optional) | `Booleanish` | Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. |
| `aria-autocomplete` (optional) | `"none" | "list" | "inline" | "both"` | Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be
presented if they are made. |
| `aria-braillelabel` (optional) | `string` | Defines a string value that labels the current element, which is intended to be converted into Braille. |
| `aria-brailleroledescription` (optional) | `string` | Defines a human-readable, author-localized abbreviated description for the role of an element, which is intended to be converted into Braille. |
| `aria-busy` (optional) | `Booleanish` | — |
| `aria-checked` (optional) | `boolean | "true" | "false" | "mixed"` | Indicates the current "checked" state of checkboxes, radio buttons, and other widgets. |
| `aria-colcount` (optional) | `number` | Defines the total number of columns in a table, grid, or treegrid. |
| `aria-colindex` (optional) | `number` | Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid. |
| `aria-colindextext` (optional) | `string` | Defines a human readable text alternative of aria-colindex. |
| `aria-colspan` (optional) | `number` | Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid. |
| `aria-controls` (optional) | `string` | Identifies the element (or elements) whose contents or presence are controlled by the current element. |
| `aria-current` (optional) | `boolean | "true" | "false" | "page" | "step" | "location" | "date" | "time"` | Indicates the element that represents the current item within a container or set of related elements. |
| `aria-describedby` (optional) | `string` | Identifies the element (or elements) that describes the object. |
| `aria-description` (optional) | `string` | Defines a string value that describes or annotates the current element. |
| `aria-details` (optional) | `string` | Identifies the element that provides a detailed, extended description for the object. |
| `aria-disabled` (optional) | `Booleanish` | Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable. |
| `aria-dropeffect` (optional) | `"none" | "link" | "copy" | "execute" | "move" | "popup"` | Indicates what functions can be performed when a dragged object is released on the drop target. |
| `aria-errormessage` (optional) | `string` | Identifies the element that provides an error message for the object. |
| `aria-expanded` (optional) | `Booleanish` | Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. |
| `aria-flowto` (optional) | `string` | Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion,
allows assistive technology to override the general default of reading in document source order. |
| `aria-grabbed` (optional) | `Booleanish` | Indicates an element's "grabbed" state in a drag-and-drop operation. |
| `aria-haspopup` (optional) | `boolean | "true" | "false" | "dialog" | "grid" | "listbox" | "menu" | "tree"` | Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. |
| `aria-hidden` (optional) | `Booleanish` | Indicates whether the element is exposed to an accessibility API. |
| `aria-invalid` (optional) | `boolean | "true" | "false" | "grammar" | "spelling"` | Indicates the entered value does not conform to the format expected by the application. |
| `aria-keyshortcuts` (optional) | `string` | Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. |
| `aria-label` (optional) | `string` | Defines a string value that labels the current element. |
| `aria-labelledby` (optional) | `string` | Identifies the element (or elements) that labels the current element. |
| `aria-level` (optional) | `number` | Defines the hierarchical level of an element within a structure. |
| `aria-live` (optional) | `"off" | "assertive" | "polite"` | Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. |
| `aria-modal` (optional) | `Booleanish` | Indicates whether an element is modal when displayed. |
| `aria-multiline` (optional) | `Booleanish` | Indicates whether a text box accepts multiple lines of input or only a single line. |
| `aria-multiselectable` (optional) | `Booleanish` | Indicates that the user may select more than one item from the current selectable descendants. |
| `aria-orientation` (optional) | `"horizontal" | "vertical"` | Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. |
| `aria-owns` (optional) | `string` | Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship
between DOM elements where the DOM hierarchy cannot be used to represent the relationship. |
| `aria-placeholder` (optional) | `string` | Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value.
A hint could be a sample value or a brief description of the expected format. |
| `aria-posinset` (optional) | `number` | Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM. |
| `aria-pressed` (optional) | `boolean | "true" | "false" | "mixed"` | Indicates the current "pressed" state of toggle buttons. |
| `aria-readonly` (optional) | `Booleanish` | Indicates that the element is not editable, but is otherwise operable. |
| `aria-relevant` (optional) | `"text" | "additions" | "additions removals" | "additions text" | "all" | "removals" | "removals additions" | "removals text" | "text additions" | "text removals"` | Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified. |
| `aria-required` (optional) | `Booleanish` | Indicates that user input is required on the element before a form may be submitted. |
| `aria-roledescription` (optional) | `string` | Defines a human-readable, author-localized description for the role of an element. |
| `aria-rowcount` (optional) | `number` | Defines the total number of rows in a table, grid, or treegrid. |
| `aria-rowindex` (optional) | `number` | Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid. |
| `aria-rowindextext` (optional) | `string` | Defines a human readable text alternative of aria-rowindex. |
| `aria-rowspan` (optional) | `number` | Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid. |
| `aria-selected` (optional) | `Booleanish` | Indicates the current "selected" state of various widgets. |
| `aria-setsize` (optional) | `number` | Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM. |
| `aria-sort` (optional) | `"none" | "ascending" | "descending" | "other"` | Indicates if items in a table or grid are sorted in ascending or descending order. |
| `aria-valuemax` (optional) | `number` | Defines the maximum allowed value for a range widget. |
| `aria-valuemin` (optional) | `number` | Defines the minimum allowed value for a range widget. |
| `aria-valuenow` (optional) | `number` | Defines the current value for a range widget. |
| `aria-valuetext` (optional) | `string` | Defines the human readable text alternative of aria-valuenow for a range widget. |
| `autoCapitalize` (optional) | `string & object | "off" | "none" | "on" | "sentences" | "words" | "characters"` | — |
| `autoCorrect` (optional) | `string` | — |
| `autoFocus` (optional) | `boolean` | — |
| `autoSave` (optional) | `string` | — |
| `className` (optional) | `string` | — |
| `color` (optional) | `string` | — |
| `content` (optional) | `string` | — |
| `contentEditable` (optional) | `Booleanish | "inherit" | "plaintext-only"` | — |
| `contextMenu` (optional) | `string` | — |
| `dangerouslySetInnerHTML` (optional) | `{  }` | — |
| `datatype` (optional) | `string` | — |
| `defaultChecked` (optional) | `boolean` | — |
| `defaultValue` (optional) | `string | number | readonly string[]` | — |
| `dir` (optional) | `string` | — |
| `draggable` (optional) | `Booleanish` | — |
| `enterKeyHint` (optional) | `"enter" | "done" | "go" | "next" | "previous" | "search" | "send"` | — |
| `exportparts` (optional) | `string` | — |
| `hidden` (optional) | `boolean` | — |
| `id` (optional) | `string` | — |
| `inert` (optional) | `boolean` | — |
| `inlist` (optional) | `any` | — |
| `inputMode` (optional) | `"none" | "search" | "text" | "tel" | "url" | "email" | "numeric" | "decimal"` | Hints at the type of data that might be entered by the user while editing the element or its contents |
| `is` (optional) | `string` | Specify that a standard HTML element should behave like a defined custom built-in element |
| `itemID` (optional) | `string` | — |
| `itemProp` (optional) | `string` | — |
| `itemRef` (optional) | `string` | — |
| `itemScope` (optional) | `boolean` | — |
| `itemType` (optional) | `string` | — |
| `lang` (optional) | `string` | — |
| `nonce` (optional) | `string` | — |
| `onAbort` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onAbortCapture` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onAnimationEnd` (optional) | `AnimationEventHandler<HTMLBodyElement>` | — |
| `onAnimationEndCapture` (optional) | `AnimationEventHandler<HTMLBodyElement>` | — |
| `onAnimationIteration` (optional) | `AnimationEventHandler<HTMLBodyElement>` | — |
| `onAnimationIterationCapture` (optional) | `AnimationEventHandler<HTMLBodyElement>` | — |
| `onAnimationStart` (optional) | `AnimationEventHandler<HTMLBodyElement>` | — |
| `onAnimationStartCapture` (optional) | `AnimationEventHandler<HTMLBodyElement>` | — |
| `onAuxClick` (optional) | `MouseEventHandler<HTMLBodyElement>` | — |
| `onAuxClickCapture` (optional) | `MouseEventHandler<HTMLBodyElement>` | — |
| `onBeforeInput` (optional) | `InputEventHandler<HTMLBodyElement>` | — |
| `onBeforeInputCapture` (optional) | `InputEventHandler<HTMLBodyElement>` | — |
| `onBeforeToggle` (optional) | `ToggleEventHandler<HTMLBodyElement>` | — |
| `onBlur` (optional) | `FocusEventHandler<HTMLBodyElement>` | — |
| `onBlurCapture` (optional) | `FocusEventHandler<HTMLBodyElement>` | — |
| `onCanPlay` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onCanPlayCapture` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onCanPlayThrough` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onCanPlayThroughCapture` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onChange` (optional) | `ChangeEventHandler<HTMLBodyElement, Element>` | — |
| `onChangeCapture` (optional) | `ChangeEventHandler<HTMLBodyElement, Element>` | — |
| `onClick` (optional) | `MouseEventHandler<HTMLBodyElement>` | — |
| `onClickCapture` (optional) | `MouseEventHandler<HTMLBodyElement>` | — |
| `onCompositionEnd` (optional) | `CompositionEventHandler<HTMLBodyElement>` | — |
| `onCompositionEndCapture` (optional) | `CompositionEventHandler<HTMLBodyElement>` | — |
| `onCompositionStart` (optional) | `CompositionEventHandler<HTMLBodyElement>` | — |
| `onCompositionStartCapture` (optional) | `CompositionEventHandler<HTMLBodyElement>` | — |
| `onCompositionUpdate` (optional) | `CompositionEventHandler<HTMLBodyElement>` | — |
| `onCompositionUpdateCapture` (optional) | `CompositionEventHandler<HTMLBodyElement>` | — |
| `onContextMenu` (optional) | `MouseEventHandler<HTMLBodyElement>` | — |
| `onContextMenuCapture` (optional) | `MouseEventHandler<HTMLBodyElement>` | — |
| `onCopy` (optional) | `ClipboardEventHandler<HTMLBodyElement>` | — |
| `onCopyCapture` (optional) | `ClipboardEventHandler<HTMLBodyElement>` | — |
| `onCut` (optional) | `ClipboardEventHandler<HTMLBodyElement>` | — |
| `onCutCapture` (optional) | `ClipboardEventHandler<HTMLBodyElement>` | — |
| `onDoubleClick` (optional) | `MouseEventHandler<HTMLBodyElement>` | — |
| `onDoubleClickCapture` (optional) | `MouseEventHandler<HTMLBodyElement>` | — |
| `onDrag` (optional) | `DragEventHandler<HTMLBodyElement>` | — |
| `onDragCapture` (optional) | `DragEventHandler<HTMLBodyElement>` | — |
| `onDragEnd` (optional) | `DragEventHandler<HTMLBodyElement>` | — |
| `onDragEndCapture` (optional) | `DragEventHandler<HTMLBodyElement>` | — |
| `onDragEnter` (optional) | `DragEventHandler<HTMLBodyElement>` | — |
| `onDragEnterCapture` (optional) | `DragEventHandler<HTMLBodyElement>` | — |
| `onDragExit` (optional) | `DragEventHandler<HTMLBodyElement>` | — |
| `onDragExitCapture` (optional) | `DragEventHandler<HTMLBodyElement>` | — |
| `onDragLeave` (optional) | `DragEventHandler<HTMLBodyElement>` | — |
| `onDragLeaveCapture` (optional) | `DragEventHandler<HTMLBodyElement>` | — |
| `onDragOver` (optional) | `DragEventHandler<HTMLBodyElement>` | — |
| `onDragOverCapture` (optional) | `DragEventHandler<HTMLBodyElement>` | — |
| `onDragStart` (optional) | `DragEventHandler<HTMLBodyElement>` | — |
| `onDragStartCapture` (optional) | `DragEventHandler<HTMLBodyElement>` | — |
| `onDrop` (optional) | `DragEventHandler<HTMLBodyElement>` | — |
| `onDropCapture` (optional) | `DragEventHandler<HTMLBodyElement>` | — |
| `onDurationChange` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onDurationChangeCapture` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onEmptied` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onEmptiedCapture` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onEncrypted` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onEncryptedCapture` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onEnded` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onEndedCapture` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onError` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onErrorCapture` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onFocus` (optional) | `FocusEventHandler<HTMLBodyElement>` | — |
| `onFocusCapture` (optional) | `FocusEventHandler<HTMLBodyElement>` | — |
| `onGotPointerCapture` (optional) | `PointerEventHandler<HTMLBodyElement>` | — |
| `onGotPointerCaptureCapture` (optional) | `PointerEventHandler<HTMLBodyElement>` | — |
| `onInput` (optional) | `InputEventHandler<HTMLBodyElement>` | — |
| `onInputCapture` (optional) | `InputEventHandler<HTMLBodyElement>` | — |
| `onInvalid` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onInvalidCapture` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onKeyDown` (optional) | `KeyboardEventHandler<HTMLBodyElement>` | — |
| `onKeyDownCapture` (optional) | `KeyboardEventHandler<HTMLBodyElement>` | — |
| `onKeyPress` (optional) | `KeyboardEventHandler<HTMLBodyElement>` | — |
| `onKeyPressCapture` (optional) | `KeyboardEventHandler<HTMLBodyElement>` | — |
| `onKeyUp` (optional) | `KeyboardEventHandler<HTMLBodyElement>` | — |
| `onKeyUpCapture` (optional) | `KeyboardEventHandler<HTMLBodyElement>` | — |
| `onLoad` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onLoadCapture` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onLoadedData` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onLoadedDataCapture` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onLoadedMetadata` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onLoadedMetadataCapture` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onLoadStart` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onLoadStartCapture` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onLostPointerCapture` (optional) | `PointerEventHandler<HTMLBodyElement>` | — |
| `onLostPointerCaptureCapture` (optional) | `PointerEventHandler<HTMLBodyElement>` | — |
| `onMouseDown` (optional) | `MouseEventHandler<HTMLBodyElement>` | — |
| `onMouseDownCapture` (optional) | `MouseEventHandler<HTMLBodyElement>` | — |
| `onMouseEnter` (optional) | `MouseEventHandler<HTMLBodyElement>` | — |
| `onMouseLeave` (optional) | `MouseEventHandler<HTMLBodyElement>` | — |
| `onMouseMove` (optional) | `MouseEventHandler<HTMLBodyElement>` | — |
| `onMouseMoveCapture` (optional) | `MouseEventHandler<HTMLBodyElement>` | — |
| `onMouseOut` (optional) | `MouseEventHandler<HTMLBodyElement>` | — |
| `onMouseOutCapture` (optional) | `MouseEventHandler<HTMLBodyElement>` | — |
| `onMouseOver` (optional) | `MouseEventHandler<HTMLBodyElement>` | — |
| `onMouseOverCapture` (optional) | `MouseEventHandler<HTMLBodyElement>` | — |
| `onMouseUp` (optional) | `MouseEventHandler<HTMLBodyElement>` | — |
| `onMouseUpCapture` (optional) | `MouseEventHandler<HTMLBodyElement>` | — |
| `onPaste` (optional) | `ClipboardEventHandler<HTMLBodyElement>` | — |
| `onPasteCapture` (optional) | `ClipboardEventHandler<HTMLBodyElement>` | — |
| `onPause` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onPauseCapture` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onPlay` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onPlayCapture` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onPlaying` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onPlayingCapture` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onPointerCancel` (optional) | `PointerEventHandler<HTMLBodyElement>` | — |
| `onPointerCancelCapture` (optional) | `PointerEventHandler<HTMLBodyElement>` | — |
| `onPointerDown` (optional) | `PointerEventHandler<HTMLBodyElement>` | — |
| `onPointerDownCapture` (optional) | `PointerEventHandler<HTMLBodyElement>` | — |
| `onPointerEnter` (optional) | `PointerEventHandler<HTMLBodyElement>` | — |
| `onPointerLeave` (optional) | `PointerEventHandler<HTMLBodyElement>` | — |
| `onPointerMove` (optional) | `PointerEventHandler<HTMLBodyElement>` | — |
| `onPointerMoveCapture` (optional) | `PointerEventHandler<HTMLBodyElement>` | — |
| `onPointerOut` (optional) | `PointerEventHandler<HTMLBodyElement>` | — |
| `onPointerOutCapture` (optional) | `PointerEventHandler<HTMLBodyElement>` | — |
| `onPointerOver` (optional) | `PointerEventHandler<HTMLBodyElement>` | — |
| `onPointerOverCapture` (optional) | `PointerEventHandler<HTMLBodyElement>` | — |
| `onPointerUp` (optional) | `PointerEventHandler<HTMLBodyElement>` | — |
| `onPointerUpCapture` (optional) | `PointerEventHandler<HTMLBodyElement>` | — |
| `onProgress` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onProgressCapture` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onRateChange` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onRateChangeCapture` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onReset` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onResetCapture` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onScroll` (optional) | `UIEventHandler<HTMLBodyElement>` | — |
| `onScrollCapture` (optional) | `UIEventHandler<HTMLBodyElement>` | — |
| `onScrollEnd` (optional) | `UIEventHandler<HTMLBodyElement>` | — |
| `onScrollEndCapture` (optional) | `UIEventHandler<HTMLBodyElement>` | — |
| `onSeeked` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onSeekedCapture` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onSeeking` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onSeekingCapture` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onSelect` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onSelectCapture` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onStalled` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onStalledCapture` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onSubmit` (optional) | `SubmitEventHandler<HTMLBodyElement>` | — |
| `onSubmitCapture` (optional) | `SubmitEventHandler<HTMLBodyElement>` | — |
| `onSuspend` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onSuspendCapture` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onTimeUpdate` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onTimeUpdateCapture` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onToggle` (optional) | `ToggleEventHandler<HTMLBodyElement>` | — |
| `onTouchCancel` (optional) | `TouchEventHandler<HTMLBodyElement>` | — |
| `onTouchCancelCapture` (optional) | `TouchEventHandler<HTMLBodyElement>` | — |
| `onTouchEnd` (optional) | `TouchEventHandler<HTMLBodyElement>` | — |
| `onTouchEndCapture` (optional) | `TouchEventHandler<HTMLBodyElement>` | — |
| `onTouchMove` (optional) | `TouchEventHandler<HTMLBodyElement>` | — |
| `onTouchMoveCapture` (optional) | `TouchEventHandler<HTMLBodyElement>` | — |
| `onTouchStart` (optional) | `TouchEventHandler<HTMLBodyElement>` | — |
| `onTouchStartCapture` (optional) | `TouchEventHandler<HTMLBodyElement>` | — |
| `onTransitionCancel` (optional) | `TransitionEventHandler<HTMLBodyElement>` | — |
| `onTransitionCancelCapture` (optional) | `TransitionEventHandler<HTMLBodyElement>` | — |
| `onTransitionEnd` (optional) | `TransitionEventHandler<HTMLBodyElement>` | — |
| `onTransitionEndCapture` (optional) | `TransitionEventHandler<HTMLBodyElement>` | — |
| `onTransitionRun` (optional) | `TransitionEventHandler<HTMLBodyElement>` | — |
| `onTransitionRunCapture` (optional) | `TransitionEventHandler<HTMLBodyElement>` | — |
| `onTransitionStart` (optional) | `TransitionEventHandler<HTMLBodyElement>` | — |
| `onTransitionStartCapture` (optional) | `TransitionEventHandler<HTMLBodyElement>` | — |
| `onVolumeChange` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onVolumeChangeCapture` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onWaiting` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onWaitingCapture` (optional) | `ReactEventHandler<HTMLBodyElement>` | — |
| `onWheel` (optional) | `WheelEventHandler<HTMLBodyElement>` | — |
| `onWheelCapture` (optional) | `WheelEventHandler<HTMLBodyElement>` | — |
| `part` (optional) | `string` | — |
| `popover` (optional) | `"" | "auto" | "manual" | "hint"` | — |
| `popoverTarget` (optional) | `string` | — |
| `popoverTargetAction` (optional) | `"toggle" | "show" | "hide"` | — |
| `prefix` (optional) | `string` | — |
| `property` (optional) | `string` | — |
| `radioGroup` (optional) | `string` | — |
| `rel` (optional) | `string` | — |
| `resource` (optional) | `string` | — |
| `results` (optional) | `number` | — |
| `rev` (optional) | `string` | — |
| `role` (optional) | `AriaRole` | — |
| `security` (optional) | `string` | — |
| `slot` (optional) | `string` | — |
| `spellCheck` (optional) | `Booleanish` | — |
| `style` (optional) | `CSSProperties` | — |
| `suppressContentEditableWarning` (optional) | `boolean` | — |
| `suppressHydrationWarning` (optional) | `boolean` | — |
| `tabIndex` (optional) | `number` | — |
| `title` (optional) | `string` | — |
| `translate` (optional) | `"yes" | "no"` | — |
| `typeof` (optional) | `string` | — |
| `unselectable` (optional) | `"off" | "on"` | — |
| `vocab` (optional) | `string` | — |

---


### `ThemeProviderHtmlProps`

**Extends** `Omit<HTMLAttributes<HTMLHtmlElement>, "children" | "lang" | "className" | "style">`
Every attribute a plain `<html>` element accepts, You can pass straight
through to `ThemeProvider`. `className` and `style` are merged with the
theme's SSR output rather than replaced.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `about` (optional) | `string` | — |
| `accessKey` (optional) | `string` | — |
| `aria-activedescendant` (optional) | `string` | Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. |
| `aria-atomic` (optional) | `Booleanish` | Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. |
| `aria-autocomplete` (optional) | `"none" | "list" | "inline" | "both"` | Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be
presented if they are made. |
| `aria-braillelabel` (optional) | `string` | Defines a string value that labels the current element, which is intended to be converted into Braille. |
| `aria-brailleroledescription` (optional) | `string` | Defines a human-readable, author-localized abbreviated description for the role of an element, which is intended to be converted into Braille. |
| `aria-busy` (optional) | `Booleanish` | — |
| `aria-checked` (optional) | `boolean | "true" | "false" | "mixed"` | Indicates the current "checked" state of checkboxes, radio buttons, and other widgets. |
| `aria-colcount` (optional) | `number` | Defines the total number of columns in a table, grid, or treegrid. |
| `aria-colindex` (optional) | `number` | Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid. |
| `aria-colindextext` (optional) | `string` | Defines a human readable text alternative of aria-colindex. |
| `aria-colspan` (optional) | `number` | Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid. |
| `aria-controls` (optional) | `string` | Identifies the element (or elements) whose contents or presence are controlled by the current element. |
| `aria-current` (optional) | `boolean | "true" | "false" | "page" | "step" | "location" | "date" | "time"` | Indicates the element that represents the current item within a container or set of related elements. |
| `aria-describedby` (optional) | `string` | Identifies the element (or elements) that describes the object. |
| `aria-description` (optional) | `string` | Defines a string value that describes or annotates the current element. |
| `aria-details` (optional) | `string` | Identifies the element that provides a detailed, extended description for the object. |
| `aria-disabled` (optional) | `Booleanish` | Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable. |
| `aria-dropeffect` (optional) | `"none" | "link" | "copy" | "execute" | "move" | "popup"` | Indicates what functions can be performed when a dragged object is released on the drop target. |
| `aria-errormessage` (optional) | `string` | Identifies the element that provides an error message for the object. |
| `aria-expanded` (optional) | `Booleanish` | Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. |
| `aria-flowto` (optional) | `string` | Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion,
allows assistive technology to override the general default of reading in document source order. |
| `aria-grabbed` (optional) | `Booleanish` | Indicates an element's "grabbed" state in a drag-and-drop operation. |
| `aria-haspopup` (optional) | `boolean | "true" | "false" | "dialog" | "grid" | "listbox" | "menu" | "tree"` | Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. |
| `aria-hidden` (optional) | `Booleanish` | Indicates whether the element is exposed to an accessibility API. |
| `aria-invalid` (optional) | `boolean | "true" | "false" | "grammar" | "spelling"` | Indicates the entered value does not conform to the format expected by the application. |
| `aria-keyshortcuts` (optional) | `string` | Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. |
| `aria-label` (optional) | `string` | Defines a string value that labels the current element. |
| `aria-labelledby` (optional) | `string` | Identifies the element (or elements) that labels the current element. |
| `aria-level` (optional) | `number` | Defines the hierarchical level of an element within a structure. |
| `aria-live` (optional) | `"off" | "assertive" | "polite"` | Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. |
| `aria-modal` (optional) | `Booleanish` | Indicates whether an element is modal when displayed. |
| `aria-multiline` (optional) | `Booleanish` | Indicates whether a text box accepts multiple lines of input or only a single line. |
| `aria-multiselectable` (optional) | `Booleanish` | Indicates that the user may select more than one item from the current selectable descendants. |
| `aria-orientation` (optional) | `"horizontal" | "vertical"` | Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. |
| `aria-owns` (optional) | `string` | Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship
between DOM elements where the DOM hierarchy cannot be used to represent the relationship. |
| `aria-placeholder` (optional) | `string` | Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value.
A hint could be a sample value or a brief description of the expected format. |
| `aria-posinset` (optional) | `number` | Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM. |
| `aria-pressed` (optional) | `boolean | "true" | "false" | "mixed"` | Indicates the current "pressed" state of toggle buttons. |
| `aria-readonly` (optional) | `Booleanish` | Indicates that the element is not editable, but is otherwise operable. |
| `aria-relevant` (optional) | `"text" | "additions" | "additions removals" | "additions text" | "all" | "removals" | "removals additions" | "removals text" | "text additions" | "text removals"` | Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified. |
| `aria-required` (optional) | `Booleanish` | Indicates that user input is required on the element before a form may be submitted. |
| `aria-roledescription` (optional) | `string` | Defines a human-readable, author-localized description for the role of an element. |
| `aria-rowcount` (optional) | `number` | Defines the total number of rows in a table, grid, or treegrid. |
| `aria-rowindex` (optional) | `number` | Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid. |
| `aria-rowindextext` (optional) | `string` | Defines a human readable text alternative of aria-rowindex. |
| `aria-rowspan` (optional) | `number` | Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid. |
| `aria-selected` (optional) | `Booleanish` | Indicates the current "selected" state of various widgets. |
| `aria-setsize` (optional) | `number` | Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM. |
| `aria-sort` (optional) | `"none" | "ascending" | "descending" | "other"` | Indicates if items in a table or grid are sorted in ascending or descending order. |
| `aria-valuemax` (optional) | `number` | Defines the maximum allowed value for a range widget. |
| `aria-valuemin` (optional) | `number` | Defines the minimum allowed value for a range widget. |
| `aria-valuenow` (optional) | `number` | Defines the current value for a range widget. |
| `aria-valuetext` (optional) | `string` | Defines the human readable text alternative of aria-valuenow for a range widget. |
| `autoCapitalize` (optional) | `string & object | "off" | "none" | "on" | "sentences" | "words" | "characters"` | — |
| `autoCorrect` (optional) | `string` | — |
| `autoFocus` (optional) | `boolean` | — |
| `autoSave` (optional) | `string` | — |
| `className` (optional) | `string` | — |
| `color` (optional) | `string` | — |
| `content` (optional) | `string` | — |
| `contentEditable` (optional) | `Booleanish | "inherit" | "plaintext-only"` | — |
| `contextMenu` (optional) | `string` | — |
| `dangerouslySetInnerHTML` (optional) | `{  }` | — |
| `datatype` (optional) | `string` | — |
| `defaultChecked` (optional) | `boolean` | — |
| `defaultValue` (optional) | `string | number | readonly string[]` | — |
| `dir` (optional) | `string` | — |
| `draggable` (optional) | `Booleanish` | — |
| `enterKeyHint` (optional) | `"enter" | "done" | "go" | "next" | "previous" | "search" | "send"` | — |
| `exportparts` (optional) | `string` | — |
| `hidden` (optional) | `boolean` | — |
| `id` (optional) | `string` | — |
| `inert` (optional) | `boolean` | — |
| `inlist` (optional) | `any` | — |
| `inputMode` (optional) | `"none" | "search" | "text" | "tel" | "url" | "email" | "numeric" | "decimal"` | Hints at the type of data that might be entered by the user while editing the element or its contents |
| `is` (optional) | `string` | Specify that a standard HTML element should behave like a defined custom built-in element |
| `itemID` (optional) | `string` | — |
| `itemProp` (optional) | `string` | — |
| `itemRef` (optional) | `string` | — |
| `itemScope` (optional) | `boolean` | — |
| `itemType` (optional) | `string` | — |
| `nonce` (optional) | `string` | — |
| `onAbort` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onAbortCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onAnimationEnd` (optional) | `AnimationEventHandler<HTMLHtmlElement>` | — |
| `onAnimationEndCapture` (optional) | `AnimationEventHandler<HTMLHtmlElement>` | — |
| `onAnimationIteration` (optional) | `AnimationEventHandler<HTMLHtmlElement>` | — |
| `onAnimationIterationCapture` (optional) | `AnimationEventHandler<HTMLHtmlElement>` | — |
| `onAnimationStart` (optional) | `AnimationEventHandler<HTMLHtmlElement>` | — |
| `onAnimationStartCapture` (optional) | `AnimationEventHandler<HTMLHtmlElement>` | — |
| `onAuxClick` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onAuxClickCapture` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onBeforeInput` (optional) | `InputEventHandler<HTMLHtmlElement>` | — |
| `onBeforeInputCapture` (optional) | `InputEventHandler<HTMLHtmlElement>` | — |
| `onBeforeToggle` (optional) | `ToggleEventHandler<HTMLHtmlElement>` | — |
| `onBlur` (optional) | `FocusEventHandler<HTMLHtmlElement>` | — |
| `onBlurCapture` (optional) | `FocusEventHandler<HTMLHtmlElement>` | — |
| `onCanPlay` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onCanPlayCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onCanPlayThrough` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onCanPlayThroughCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onChange` (optional) | `ChangeEventHandler<HTMLHtmlElement, Element>` | — |
| `onChangeCapture` (optional) | `ChangeEventHandler<HTMLHtmlElement, Element>` | — |
| `onClick` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onClickCapture` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onCompositionEnd` (optional) | `CompositionEventHandler<HTMLHtmlElement>` | — |
| `onCompositionEndCapture` (optional) | `CompositionEventHandler<HTMLHtmlElement>` | — |
| `onCompositionStart` (optional) | `CompositionEventHandler<HTMLHtmlElement>` | — |
| `onCompositionStartCapture` (optional) | `CompositionEventHandler<HTMLHtmlElement>` | — |
| `onCompositionUpdate` (optional) | `CompositionEventHandler<HTMLHtmlElement>` | — |
| `onCompositionUpdateCapture` (optional) | `CompositionEventHandler<HTMLHtmlElement>` | — |
| `onContextMenu` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onContextMenuCapture` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onCopy` (optional) | `ClipboardEventHandler<HTMLHtmlElement>` | — |
| `onCopyCapture` (optional) | `ClipboardEventHandler<HTMLHtmlElement>` | — |
| `onCut` (optional) | `ClipboardEventHandler<HTMLHtmlElement>` | — |
| `onCutCapture` (optional) | `ClipboardEventHandler<HTMLHtmlElement>` | — |
| `onDoubleClick` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onDoubleClickCapture` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onDrag` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDragCapture` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDragEnd` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDragEndCapture` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDragEnter` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDragEnterCapture` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDragExit` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDragExitCapture` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDragLeave` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDragLeaveCapture` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDragOver` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDragOverCapture` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDragStart` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDragStartCapture` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDrop` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDropCapture` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDurationChange` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onDurationChangeCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onEmptied` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onEmptiedCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onEncrypted` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onEncryptedCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onEnded` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onEndedCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onError` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onErrorCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onFocus` (optional) | `FocusEventHandler<HTMLHtmlElement>` | — |
| `onFocusCapture` (optional) | `FocusEventHandler<HTMLHtmlElement>` | — |
| `onGotPointerCapture` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onGotPointerCaptureCapture` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onInput` (optional) | `InputEventHandler<HTMLHtmlElement>` | — |
| `onInputCapture` (optional) | `InputEventHandler<HTMLHtmlElement>` | — |
| `onInvalid` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onInvalidCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onKeyDown` (optional) | `KeyboardEventHandler<HTMLHtmlElement>` | — |
| `onKeyDownCapture` (optional) | `KeyboardEventHandler<HTMLHtmlElement>` | — |
| `onKeyPress` (optional) | `KeyboardEventHandler<HTMLHtmlElement>` | — |
| `onKeyPressCapture` (optional) | `KeyboardEventHandler<HTMLHtmlElement>` | — |
| `onKeyUp` (optional) | `KeyboardEventHandler<HTMLHtmlElement>` | — |
| `onKeyUpCapture` (optional) | `KeyboardEventHandler<HTMLHtmlElement>` | — |
| `onLoad` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onLoadCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onLoadedData` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onLoadedDataCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onLoadedMetadata` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onLoadedMetadataCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onLoadStart` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onLoadStartCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onLostPointerCapture` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onLostPointerCaptureCapture` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onMouseDown` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onMouseDownCapture` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onMouseEnter` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onMouseLeave` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onMouseMove` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onMouseMoveCapture` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onMouseOut` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onMouseOutCapture` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onMouseOver` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onMouseOverCapture` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onMouseUp` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onMouseUpCapture` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onPaste` (optional) | `ClipboardEventHandler<HTMLHtmlElement>` | — |
| `onPasteCapture` (optional) | `ClipboardEventHandler<HTMLHtmlElement>` | — |
| `onPause` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onPauseCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onPlay` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onPlayCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onPlaying` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onPlayingCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onPointerCancel` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onPointerCancelCapture` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onPointerDown` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onPointerDownCapture` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onPointerEnter` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onPointerLeave` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onPointerMove` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onPointerMoveCapture` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onPointerOut` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onPointerOutCapture` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onPointerOver` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onPointerOverCapture` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onPointerUp` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onPointerUpCapture` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onProgress` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onProgressCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onRateChange` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onRateChangeCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onReset` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onResetCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onScroll` (optional) | `UIEventHandler<HTMLHtmlElement>` | — |
| `onScrollCapture` (optional) | `UIEventHandler<HTMLHtmlElement>` | — |
| `onScrollEnd` (optional) | `UIEventHandler<HTMLHtmlElement>` | — |
| `onScrollEndCapture` (optional) | `UIEventHandler<HTMLHtmlElement>` | — |
| `onSeeked` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onSeekedCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onSeeking` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onSeekingCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onSelect` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onSelectCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onStalled` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onStalledCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onSubmit` (optional) | `SubmitEventHandler<HTMLHtmlElement>` | — |
| `onSubmitCapture` (optional) | `SubmitEventHandler<HTMLHtmlElement>` | — |
| `onSuspend` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onSuspendCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onTimeUpdate` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onTimeUpdateCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onToggle` (optional) | `ToggleEventHandler<HTMLHtmlElement>` | — |
| `onTouchCancel` (optional) | `TouchEventHandler<HTMLHtmlElement>` | — |
| `onTouchCancelCapture` (optional) | `TouchEventHandler<HTMLHtmlElement>` | — |
| `onTouchEnd` (optional) | `TouchEventHandler<HTMLHtmlElement>` | — |
| `onTouchEndCapture` (optional) | `TouchEventHandler<HTMLHtmlElement>` | — |
| `onTouchMove` (optional) | `TouchEventHandler<HTMLHtmlElement>` | — |
| `onTouchMoveCapture` (optional) | `TouchEventHandler<HTMLHtmlElement>` | — |
| `onTouchStart` (optional) | `TouchEventHandler<HTMLHtmlElement>` | — |
| `onTouchStartCapture` (optional) | `TouchEventHandler<HTMLHtmlElement>` | — |
| `onTransitionCancel` (optional) | `TransitionEventHandler<HTMLHtmlElement>` | — |
| `onTransitionCancelCapture` (optional) | `TransitionEventHandler<HTMLHtmlElement>` | — |
| `onTransitionEnd` (optional) | `TransitionEventHandler<HTMLHtmlElement>` | — |
| `onTransitionEndCapture` (optional) | `TransitionEventHandler<HTMLHtmlElement>` | — |
| `onTransitionRun` (optional) | `TransitionEventHandler<HTMLHtmlElement>` | — |
| `onTransitionRunCapture` (optional) | `TransitionEventHandler<HTMLHtmlElement>` | — |
| `onTransitionStart` (optional) | `TransitionEventHandler<HTMLHtmlElement>` | — |
| `onTransitionStartCapture` (optional) | `TransitionEventHandler<HTMLHtmlElement>` | — |
| `onVolumeChange` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onVolumeChangeCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onWaiting` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onWaitingCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onWheel` (optional) | `WheelEventHandler<HTMLHtmlElement>` | — |
| `onWheelCapture` (optional) | `WheelEventHandler<HTMLHtmlElement>` | — |
| `part` (optional) | `string` | — |
| `popover` (optional) | `"" | "auto" | "manual" | "hint"` | — |
| `popoverTarget` (optional) | `string` | — |
| `popoverTargetAction` (optional) | `"toggle" | "show" | "hide"` | — |
| `prefix` (optional) | `string` | — |
| `property` (optional) | `string` | — |
| `radioGroup` (optional) | `string` | — |
| `rel` (optional) | `string` | — |
| `resource` (optional) | `string` | — |
| `results` (optional) | `number` | — |
| `rev` (optional) | `string` | — |
| `role` (optional) | `AriaRole` | — |
| `security` (optional) | `string` | — |
| `slot` (optional) | `string` | — |
| `spellCheck` (optional) | `Booleanish` | — |
| `style` (optional) | `CSSProperties` | — |
| `suppressContentEditableWarning` (optional) | `boolean` | — |
| `suppressHydrationWarning` (optional) | `boolean` | — |
| `tabIndex` (optional) | `number` | — |
| `title` (optional) | `string` | — |
| `translate` (optional) | `"yes" | "no"` | — |
| `typeof` (optional) | `string` | — |
| `unselectable` (optional) | `"off" | "on"` | — |
| `vocab` (optional) | `string` | — |

---


### `ThemeProviderProps<T extends ThemeDefinition>`

**Extends** `ThemeProviderHtmlProps`
Every attribute a plain `<html>` element accepts, You can pass straight
through to `ThemeProvider`. `className` and `style` are merged with the
theme's SSR output rather than replaced.

| Member | Type | Description |
| ------ | ---- | ----------- |
| `about` (optional) | `string` | — |
| `accessKey` (optional) | `string` | — |
| `aria-activedescendant` (optional) | `string` | Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. |
| `aria-atomic` (optional) | `Booleanish` | Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. |
| `aria-autocomplete` (optional) | `"none" | "list" | "inline" | "both"` | Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be
presented if they are made. |
| `aria-braillelabel` (optional) | `string` | Defines a string value that labels the current element, which is intended to be converted into Braille. |
| `aria-brailleroledescription` (optional) | `string` | Defines a human-readable, author-localized abbreviated description for the role of an element, which is intended to be converted into Braille. |
| `aria-busy` (optional) | `Booleanish` | — |
| `aria-checked` (optional) | `boolean | "true" | "false" | "mixed"` | Indicates the current "checked" state of checkboxes, radio buttons, and other widgets. |
| `aria-colcount` (optional) | `number` | Defines the total number of columns in a table, grid, or treegrid. |
| `aria-colindex` (optional) | `number` | Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid. |
| `aria-colindextext` (optional) | `string` | Defines a human readable text alternative of aria-colindex. |
| `aria-colspan` (optional) | `number` | Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid. |
| `aria-controls` (optional) | `string` | Identifies the element (or elements) whose contents or presence are controlled by the current element. |
| `aria-current` (optional) | `boolean | "true" | "false" | "page" | "step" | "location" | "date" | "time"` | Indicates the element that represents the current item within a container or set of related elements. |
| `aria-describedby` (optional) | `string` | Identifies the element (or elements) that describes the object. |
| `aria-description` (optional) | `string` | Defines a string value that describes or annotates the current element. |
| `aria-details` (optional) | `string` | Identifies the element that provides a detailed, extended description for the object. |
| `aria-disabled` (optional) | `Booleanish` | Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable. |
| `aria-dropeffect` (optional) | `"none" | "link" | "copy" | "execute" | "move" | "popup"` | Indicates what functions can be performed when a dragged object is released on the drop target. |
| `aria-errormessage` (optional) | `string` | Identifies the element that provides an error message for the object. |
| `aria-expanded` (optional) | `Booleanish` | Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. |
| `aria-flowto` (optional) | `string` | Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion,
allows assistive technology to override the general default of reading in document source order. |
| `aria-grabbed` (optional) | `Booleanish` | Indicates an element's "grabbed" state in a drag-and-drop operation. |
| `aria-haspopup` (optional) | `boolean | "true" | "false" | "dialog" | "grid" | "listbox" | "menu" | "tree"` | Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. |
| `aria-hidden` (optional) | `Booleanish` | Indicates whether the element is exposed to an accessibility API. |
| `aria-invalid` (optional) | `boolean | "true" | "false" | "grammar" | "spelling"` | Indicates the entered value does not conform to the format expected by the application. |
| `aria-keyshortcuts` (optional) | `string` | Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. |
| `aria-label` (optional) | `string` | Defines a string value that labels the current element. |
| `aria-labelledby` (optional) | `string` | Identifies the element (or elements) that labels the current element. |
| `aria-level` (optional) | `number` | Defines the hierarchical level of an element within a structure. |
| `aria-live` (optional) | `"off" | "assertive" | "polite"` | Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. |
| `aria-modal` (optional) | `Booleanish` | Indicates whether an element is modal when displayed. |
| `aria-multiline` (optional) | `Booleanish` | Indicates whether a text box accepts multiple lines of input or only a single line. |
| `aria-multiselectable` (optional) | `Booleanish` | Indicates that the user may select more than one item from the current selectable descendants. |
| `aria-orientation` (optional) | `"horizontal" | "vertical"` | Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. |
| `aria-owns` (optional) | `string` | Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship
between DOM elements where the DOM hierarchy cannot be used to represent the relationship. |
| `aria-placeholder` (optional) | `string` | Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value.
A hint could be a sample value or a brief description of the expected format. |
| `aria-posinset` (optional) | `number` | Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM. |
| `aria-pressed` (optional) | `boolean | "true" | "false" | "mixed"` | Indicates the current "pressed" state of toggle buttons. |
| `aria-readonly` (optional) | `Booleanish` | Indicates that the element is not editable, but is otherwise operable. |
| `aria-relevant` (optional) | `"text" | "additions" | "additions removals" | "additions text" | "all" | "removals" | "removals additions" | "removals text" | "text additions" | "text removals"` | Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified. |
| `aria-required` (optional) | `Booleanish` | Indicates that user input is required on the element before a form may be submitted. |
| `aria-roledescription` (optional) | `string` | Defines a human-readable, author-localized description for the role of an element. |
| `aria-rowcount` (optional) | `number` | Defines the total number of rows in a table, grid, or treegrid. |
| `aria-rowindex` (optional) | `number` | Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid. |
| `aria-rowindextext` (optional) | `string` | Defines a human readable text alternative of aria-rowindex. |
| `aria-rowspan` (optional) | `number` | Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid. |
| `aria-selected` (optional) | `Booleanish` | Indicates the current "selected" state of various widgets. |
| `aria-setsize` (optional) | `number` | Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM. |
| `aria-sort` (optional) | `"none" | "ascending" | "descending" | "other"` | Indicates if items in a table or grid are sorted in ascending or descending order. |
| `aria-valuemax` (optional) | `number` | Defines the maximum allowed value for a range widget. |
| `aria-valuemin` (optional) | `number` | Defines the minimum allowed value for a range widget. |
| `aria-valuenow` (optional) | `number` | Defines the current value for a range widget. |
| `aria-valuetext` (optional) | `string` | Defines the human readable text alternative of aria-valuenow for a range widget. |
| `autoCapitalize` (optional) | `string & object | "off" | "none" | "on" | "sentences" | "words" | "characters"` | — |
| `autoCorrect` (optional) | `string` | — |
| `autoFocus` (optional) | `boolean` | — |
| `autoSave` (optional) | `string` | — |
| `body` (optional) | `ThemeProviderBodyProps` | Attributes forwarded to the rendered `<body>` element. |
| `children` | `ReactNode` | — |
| `className` (optional) | `string` | — |
| `color` (optional) | `string` | — |
| `content` (optional) | `string` | — |
| `contentEditable` (optional) | `Booleanish | "inherit" | "plaintext-only"` | — |
| `contextMenu` (optional) | `string` | — |
| `dangerouslySetInnerHTML` (optional) | `{  }` | — |
| `datatype` (optional) | `string` | — |
| `defaultChecked` (optional) | `boolean` | — |
| `defaultTheme` (optional) | `T["name"]` | Theme to be applied as default.
Pass defaultTheme="light" for the theme-kit's default neutral light theme.
And defaultTheme="dark" for default neutral dark theme. |
| `defaultValue` (optional) | `string | number | readonly string[]` | — |
| `dir` (optional) | `string` | — |
| `draggable` (optional) | `Booleanish` | — |
| `enterKeyHint` (optional) | `"enter" | "done" | "go" | "next" | "previous" | "search" | "send"` | — |
| `exportparts` (optional) | `string` | — |
| `font` (optional) | `string` | Font family applied to the body element (e.g. "Inter, sans-serif"). |
| `hidden` (optional) | `boolean` | — |
| `id` (optional) | `string` | — |
| `inert` (optional) | `boolean` | — |
| `inlist` (optional) | `any` | — |
| `inputMode` (optional) | `"none" | "search" | "text" | "tel" | "url" | "email" | "numeric" | "decimal"` | Hints at the type of data that might be entered by the user while editing the element or its contents |
| `is` (optional) | `string` | Specify that a standard HTML element should behave like a defined custom built-in element |
| `itemID` (optional) | `string` | — |
| `itemProp` (optional) | `string` | — |
| `itemRef` (optional) | `string` | — |
| `itemScope` (optional) | `boolean` | — |
| `itemType` (optional) | `string` | — |
| `lang` (optional) | `string` | The lang attribute name the language of the element's content. |
| `nonce` (optional) | `string` | — |
| `onAbort` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onAbortCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onAnimationEnd` (optional) | `AnimationEventHandler<HTMLHtmlElement>` | — |
| `onAnimationEndCapture` (optional) | `AnimationEventHandler<HTMLHtmlElement>` | — |
| `onAnimationIteration` (optional) | `AnimationEventHandler<HTMLHtmlElement>` | — |
| `onAnimationIterationCapture` (optional) | `AnimationEventHandler<HTMLHtmlElement>` | — |
| `onAnimationStart` (optional) | `AnimationEventHandler<HTMLHtmlElement>` | — |
| `onAnimationStartCapture` (optional) | `AnimationEventHandler<HTMLHtmlElement>` | — |
| `onAuxClick` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onAuxClickCapture` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onBeforeInput` (optional) | `InputEventHandler<HTMLHtmlElement>` | — |
| `onBeforeInputCapture` (optional) | `InputEventHandler<HTMLHtmlElement>` | — |
| `onBeforeToggle` (optional) | `ToggleEventHandler<HTMLHtmlElement>` | — |
| `onBlur` (optional) | `FocusEventHandler<HTMLHtmlElement>` | — |
| `onBlurCapture` (optional) | `FocusEventHandler<HTMLHtmlElement>` | — |
| `onCanPlay` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onCanPlayCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onCanPlayThrough` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onCanPlayThroughCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onChange` (optional) | `ChangeEventHandler<HTMLHtmlElement, Element>` | — |
| `onChangeCapture` (optional) | `ChangeEventHandler<HTMLHtmlElement, Element>` | — |
| `onClick` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onClickCapture` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onCompositionEnd` (optional) | `CompositionEventHandler<HTMLHtmlElement>` | — |
| `onCompositionEndCapture` (optional) | `CompositionEventHandler<HTMLHtmlElement>` | — |
| `onCompositionStart` (optional) | `CompositionEventHandler<HTMLHtmlElement>` | — |
| `onCompositionStartCapture` (optional) | `CompositionEventHandler<HTMLHtmlElement>` | — |
| `onCompositionUpdate` (optional) | `CompositionEventHandler<HTMLHtmlElement>` | — |
| `onCompositionUpdateCapture` (optional) | `CompositionEventHandler<HTMLHtmlElement>` | — |
| `onContextMenu` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onContextMenuCapture` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onCopy` (optional) | `ClipboardEventHandler<HTMLHtmlElement>` | — |
| `onCopyCapture` (optional) | `ClipboardEventHandler<HTMLHtmlElement>` | — |
| `onCut` (optional) | `ClipboardEventHandler<HTMLHtmlElement>` | — |
| `onCutCapture` (optional) | `ClipboardEventHandler<HTMLHtmlElement>` | — |
| `onDoubleClick` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onDoubleClickCapture` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onDrag` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDragCapture` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDragEnd` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDragEndCapture` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDragEnter` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDragEnterCapture` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDragExit` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDragExitCapture` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDragLeave` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDragLeaveCapture` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDragOver` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDragOverCapture` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDragStart` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDragStartCapture` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDrop` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDropCapture` (optional) | `DragEventHandler<HTMLHtmlElement>` | — |
| `onDurationChange` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onDurationChangeCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onEmptied` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onEmptiedCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onEncrypted` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onEncryptedCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onEnded` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onEndedCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onError` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onErrorCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onFocus` (optional) | `FocusEventHandler<HTMLHtmlElement>` | — |
| `onFocusCapture` (optional) | `FocusEventHandler<HTMLHtmlElement>` | — |
| `onGotPointerCapture` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onGotPointerCaptureCapture` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onInput` (optional) | `InputEventHandler<HTMLHtmlElement>` | — |
| `onInputCapture` (optional) | `InputEventHandler<HTMLHtmlElement>` | — |
| `onInvalid` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onInvalidCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onKeyDown` (optional) | `KeyboardEventHandler<HTMLHtmlElement>` | — |
| `onKeyDownCapture` (optional) | `KeyboardEventHandler<HTMLHtmlElement>` | — |
| `onKeyPress` (optional) | `KeyboardEventHandler<HTMLHtmlElement>` | — |
| `onKeyPressCapture` (optional) | `KeyboardEventHandler<HTMLHtmlElement>` | — |
| `onKeyUp` (optional) | `KeyboardEventHandler<HTMLHtmlElement>` | — |
| `onKeyUpCapture` (optional) | `KeyboardEventHandler<HTMLHtmlElement>` | — |
| `onLoad` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onLoadCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onLoadedData` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onLoadedDataCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onLoadedMetadata` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onLoadedMetadataCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onLoadStart` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onLoadStartCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onLostPointerCapture` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onLostPointerCaptureCapture` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onMouseDown` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onMouseDownCapture` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onMouseEnter` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onMouseLeave` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onMouseMove` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onMouseMoveCapture` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onMouseOut` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onMouseOutCapture` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onMouseOver` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onMouseOverCapture` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onMouseUp` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onMouseUpCapture` (optional) | `MouseEventHandler<HTMLHtmlElement>` | — |
| `onPaste` (optional) | `ClipboardEventHandler<HTMLHtmlElement>` | — |
| `onPasteCapture` (optional) | `ClipboardEventHandler<HTMLHtmlElement>` | — |
| `onPause` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onPauseCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onPlay` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onPlayCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onPlaying` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onPlayingCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onPointerCancel` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onPointerCancelCapture` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onPointerDown` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onPointerDownCapture` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onPointerEnter` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onPointerLeave` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onPointerMove` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onPointerMoveCapture` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onPointerOut` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onPointerOutCapture` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onPointerOver` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onPointerOverCapture` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onPointerUp` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onPointerUpCapture` (optional) | `PointerEventHandler<HTMLHtmlElement>` | — |
| `onProgress` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onProgressCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onRateChange` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onRateChangeCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onReset` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onResetCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onScroll` (optional) | `UIEventHandler<HTMLHtmlElement>` | — |
| `onScrollCapture` (optional) | `UIEventHandler<HTMLHtmlElement>` | — |
| `onScrollEnd` (optional) | `UIEventHandler<HTMLHtmlElement>` | — |
| `onScrollEndCapture` (optional) | `UIEventHandler<HTMLHtmlElement>` | — |
| `onSeeked` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onSeekedCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onSeeking` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onSeekingCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onSelect` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onSelectCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onStalled` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onStalledCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onSubmit` (optional) | `SubmitEventHandler<HTMLHtmlElement>` | — |
| `onSubmitCapture` (optional) | `SubmitEventHandler<HTMLHtmlElement>` | — |
| `onSuspend` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onSuspendCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onTimeUpdate` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onTimeUpdateCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onToggle` (optional) | `ToggleEventHandler<HTMLHtmlElement>` | — |
| `onTouchCancel` (optional) | `TouchEventHandler<HTMLHtmlElement>` | — |
| `onTouchCancelCapture` (optional) | `TouchEventHandler<HTMLHtmlElement>` | — |
| `onTouchEnd` (optional) | `TouchEventHandler<HTMLHtmlElement>` | — |
| `onTouchEndCapture` (optional) | `TouchEventHandler<HTMLHtmlElement>` | — |
| `onTouchMove` (optional) | `TouchEventHandler<HTMLHtmlElement>` | — |
| `onTouchMoveCapture` (optional) | `TouchEventHandler<HTMLHtmlElement>` | — |
| `onTouchStart` (optional) | `TouchEventHandler<HTMLHtmlElement>` | — |
| `onTouchStartCapture` (optional) | `TouchEventHandler<HTMLHtmlElement>` | — |
| `onTransitionCancel` (optional) | `TransitionEventHandler<HTMLHtmlElement>` | — |
| `onTransitionCancelCapture` (optional) | `TransitionEventHandler<HTMLHtmlElement>` | — |
| `onTransitionEnd` (optional) | `TransitionEventHandler<HTMLHtmlElement>` | — |
| `onTransitionEndCapture` (optional) | `TransitionEventHandler<HTMLHtmlElement>` | — |
| `onTransitionRun` (optional) | `TransitionEventHandler<HTMLHtmlElement>` | — |
| `onTransitionRunCapture` (optional) | `TransitionEventHandler<HTMLHtmlElement>` | — |
| `onTransitionStart` (optional) | `TransitionEventHandler<HTMLHtmlElement>` | — |
| `onTransitionStartCapture` (optional) | `TransitionEventHandler<HTMLHtmlElement>` | — |
| `onVolumeChange` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onVolumeChangeCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onWaiting` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onWaitingCapture` (optional) | `ReactEventHandler<HTMLHtmlElement>` | — |
| `onWheel` (optional) | `WheelEventHandler<HTMLHtmlElement>` | — |
| `onWheelCapture` (optional) | `WheelEventHandler<HTMLHtmlElement>` | — |
| `part` (optional) | `string` | — |
| `popover` (optional) | `"" | "auto" | "manual" | "hint"` | — |
| `popoverTarget` (optional) | `string` | — |
| `popoverTargetAction` (optional) | `"toggle" | "show" | "hide"` | — |
| `prefix` (optional) | `string` | — |
| `property` (optional) | `string` | — |
| `radioGroup` (optional) | `string` | — |
| `rel` (optional) | `string` | — |
| `resource` (optional) | `string` | — |
| `results` (optional) | `number` | — |
| `rev` (optional) | `string` | — |
| `role` (optional) | `AriaRole` | — |
| `scheduled` (optional) | `false | ScheduledThemeOptions<T>` | Sunrise/sunset scheduling. Passed to the client runtime; the server
resolves the initial theme (zero-flash) and the client schedule controls
activation. Exposed reactively via `useThemeSchedule()`. |
| `scrollbar` (optional) | `boolean | PrePaintScrollbarOptions` | Opt into a custom document scrollbar that exists from the very first
paint �?" no native-scrollbar flash, no gap while the bundle hydrates.

`true` builds the pre-paint overlay with defaults; pass
`PrePaintScrollbarOptions` to customize it. The server emits the overlay
`tk-scrollbar` class on `<html>` plus a blocking `<style>` (via
`createPrePaintScrollbarCSS`) so the native scrollbar is hidden from the
very first paint �?" no flash and no hydration mismatch. When your
`<ThemeScrollbar>` / `createOverlayScrollbar` hydrates, the engine creates
the custom strips and takes over. Import
`@theme-kit/core/scrollbar.css` for the pre-paint styles. |
| `security` (optional) | `string` | — |
| `slot` (optional) | `string` | — |
| `spellCheck` (optional) | `Booleanish` | — |
| `style` (optional) | `CSSProperties` | — |
| `suppressContentEditableWarning` (optional) | `boolean` | — |
| `suppressHydrationWarning` (optional) | `boolean` | — |
| `tabIndex` (optional) | `number` | — |
| `themes` (optional) | `readonly T[]` | Collection of themes to be specified for the application. |
| `title` (optional) | `string` | — |
| `transition` (optional) | `boolean | ThemeTransitionOptions` | CSS transition options for theme changes. |
| `translate` (optional) | `"yes" | "no"` | — |
| `typeof` (optional) | `string` | — |
| `unselectable` (optional) | `"off" | "on"` | — |
| `vocab` (optional) | `string` | — |

---


### `ThemeScopeProps`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `children` | `ReactNode` | — |
| `className` (optional) | `string` | — |
| `family` (optional) | `string` | Theme family for the scoped subtree. When `mode` is omitted the scope
 follows the provider's current mode (light/dark/system). |
| `mode` (optional) | `ThemeMode` | Mode for a family-based scope. Optional — defaults to the provider's
 current mode so `family="plum"` flips light/dark with the page. |
| `theme` (optional) | `string` | Exact theme name, family name, or a `{ family, mode }`-style object.
 When `family`/`mode` are also passed, `theme` wins (it's the explicit
 selection). Omit to follow the global selection inside a new boundary. |
| `themes` (optional) | `readonly ThemeDefinition<string>[]` | Local theme definitions for genuinely isolated components. Resolved FIRST
 (they shadow same-named parent themes), then the provider's registry
 falls back — no second runtime is created. |
| `transition` (optional) | `boolean | ThemeTransitionOptions` | Transition for this scope's own theme changes. `undefined` inherits the
 `<ThemeProvider/>` transition, `false` disables it, `true` inherits, and
 an object is merged over the provider's config (local keys win). |

---


### `ThemeScrollbarProps`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `activeThumbColor` (optional) | `string` | — |
| `animationDuration` (optional) | `number` | — |
| `appearance` (optional) | `ThemeScrollbarAppearance` | Grouped appearance options. Flat props override these. |
| `arrowDownIcon` (optional) | `ReactNode` | JSX / element for the "scroll down" button. Falls back to `arrowIcon`. |
| `arrowIcon` (optional) | `ReactNode` | JSX / element rendered inside every arrow button (overrides the built-in
 CSS triangle). Accepts any `ReactNode`. |
| `arrowLeftIcon` (optional) | `ReactNode` | JSX / element for the "scroll left" button. Falls back to `arrowIcon`. |
| `arrowRightIcon` (optional) | `ReactNode` | JSX / element for the "scroll right" button. Falls back to `arrowIcon`. |
| `arrows` (optional) | `boolean` | — |
| `arrowUpIcon` (optional) | `ReactNode` | JSX / element for the "scroll up" button. Falls back to `arrowIcon`. |
| `autoHide` (optional) | `boolean` | Flat aliases mirroring `OverlayScrollbarOptions` (for convenience /
 backwards compatibility). Each is overridden by the matching flat prop. |
| `autoHideDelay` (optional) | `number` | Idle (ms) before a revealed strip fades out after its last activity.
 Each host has its own timer, so only the strip you're scrolling/hovering
 is revealed, then it fades after idle; other scrollbars stay hidden.
 Default `900`. Only takes effect when `autoHide` is `true`. |
| `axes` (optional) | `ScrollbarAxis[]` | — |
| `behavior` (optional) | `ThemeScrollbarBehavior` | Grouped behavior options. Flat props (e.g. `autoHide`) override these. |
| `children` (optional) | `ReactNode` | — |
| `clickToJump` (optional) | `boolean` | — |
| `dir` (optional) | `"auto" | "ltr" | "rtl"` | — |
| `draggable` (optional) | `boolean` | — |
| `duration` (optional) | `number` | — |
| `exclude` (optional) | `string[] | null` | — |
| `hoverExpand` (optional) | `boolean` | — |
| `hoverThickness` (optional) | `number` | — |
| `icons` (optional) | `ThemeScrollbarIcons` | Grouped arrow button icons. Flat `arrow*Icon` props override these. |
| `include` (optional) | `string[] | null` | — |
| `minThumbSize` (optional) | `number` | — |
| `offset` (optional) | `number` | — |
| `overscroll` (optional) | `boolean` | — |
| `radius` (optional) | `number` | — |
| `smooth` (optional) | `boolean` | — |
| `thickness` (optional) | `number` | — |
| `thumbColor` (optional) | `string` | — |
| `thumbHoverColor` (optional) | `string` | — |
| `thumbOpacity` (optional) | `number` | — |
| `touch` (optional) | `boolean` | — |
| `trackColor` (optional) | `string` | — |
| `trackOpacity` (optional) | `number` | — |
| `zIndex` (optional) | `number` | — |

---
