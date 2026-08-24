## @theme-kit/web

> Generated from `packages/web/src` by `apps/docs/scripts/generate-api-reference.mjs`. Do not edit by hand — run `pnpm --filter @theme-kit/docs api:generate`.

## Functions

### `defineCustomElements(): void`
**Returns** `void`

---


### `getProviderRuntime(el?): ThemeRuntime<ThemeDefinition<string>> | undefined`
| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `el` | `ThemeKitProviderElement` (optional) | — |

**Returns** `ThemeRuntime<ThemeDefinition<string>> | undefined`

---


### `getThemeSchedule(): ThemeSchedule | null`
Reactive sunrise/sunset schedule controller. Returns `null` when the
provider was created without the `scheduled` option.

```ts
const schedule = getThemeSchedule();
schedule?.enable();
schedule?.disable();
schedule?.set({ timeZone: "Asia/Kathmandu" });
```

**Returns** `ThemeSchedule | null`

---


### `useThemeFamily(): string`
**Returns** `string`

---


### `useThemeMode(): ThemeMode`
**Returns** `ThemeMode`

---


### `useThemeRuntime(): ThemeRuntime<ThemeDefinition<string>>`
**Returns** `ThemeRuntime<ThemeDefinition<string>>`

---


### `useThemeTokens(): ThemeTokens | undefined`
**Returns** `ThemeTokens | undefined`

---


### `useThemeValue(): ThemeDefinition<string>`
**Returns** `ThemeDefinition<string>`

---

## Classes

### `class ThemeKitInspector`

**Extends** `HTMLElement`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `constructor` | `ThemeKitInspector` | — |
| `accessKey` | `string` | The **`HTMLElement.accessKey`** property sets the keystroke which a user can press to jump to a given element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/accessKey) |
| readonly `accessKeyLabel` | `string` | The **`HTMLElement.accessKeyLabel`** read-only property returns a string containing the element's browser-assigned access key (if any); otherwise it returns an empty string.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/accessKeyLabel) |
| `ariaActiveDescendantElement` | `Element | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaActiveDescendantElement) |
| `ariaAtomic` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaAtomic) |
| `ariaAutoComplete` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaAutoComplete) |
| `ariaBrailleLabel` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaBrailleLabel) |
| `ariaBrailleRoleDescription` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaBrailleRoleDescription) |
| `ariaBusy` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaBusy) |
| `ariaChecked` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaChecked) |
| `ariaColCount` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaColCount) |
| `ariaColIndex` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaColIndex) |
| `ariaColIndexText` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaColIndexText) |
| `ariaColSpan` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaColSpan) |
| `ariaControlsElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaControlsElements) |
| `ariaCurrent` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaCurrent) |
| `ariaDescribedByElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaDescribedByElements) |
| `ariaDescription` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaDescription) |
| `ariaDetailsElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaDetailsElements) |
| `ariaDisabled` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaDisabled) |
| `ariaErrorMessageElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaErrorMessageElements) |
| `ariaExpanded` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaExpanded) |
| `ariaFlowToElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaFlowToElements) |
| `ariaHasPopup` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaHasPopup) |
| `ariaHidden` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaHidden) |
| `ariaInvalid` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaInvalid) |
| `ariaKeyShortcuts` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaKeyShortcuts) |
| `ariaLabel` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaLabel) |
| `ariaLabelledByElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaLabelledByElements) |
| `ariaLevel` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaLevel) |
| `ariaLive` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaLive) |
| `ariaModal` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaModal) |
| `ariaMultiLine` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaMultiLine) |
| `ariaMultiSelectable` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaMultiSelectable) |
| `ariaOrientation` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaOrientation) |
| `ariaOwnsElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaOwnsElements) |
| `ariaPlaceholder` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaPlaceholder) |
| `ariaPosInSet` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaPosInSet) |
| `ariaPressed` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaPressed) |
| `ariaReadOnly` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaReadOnly) |
| `ariaRelevant` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRelevant) |
| `ariaRequired` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRequired) |
| `ariaRoleDescription` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRoleDescription) |
| `ariaRowCount` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRowCount) |
| `ariaRowIndex` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRowIndex) |
| `ariaRowIndexText` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRowIndexText) |
| `ariaRowSpan` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRowSpan) |
| `ariaSelected` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaSelected) |
| `ariaSetSize` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaSetSize) |
| `ariaSort` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaSort) |
| `ariaValueMax` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaValueMax) |
| `ariaValueMin` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaValueMin) |
| `ariaValueNow` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaValueNow) |
| `ariaValueText` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaValueText) |
| readonly `assignedSlot` | `HTMLSlotElement | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/assignedSlot) |
| readonly `ATTRIBUTE_NODE` | `2` | — |
| readonly `attributes` | `NamedNodeMap` | The **`Element.attributes`** property returns a live collection of all attribute nodes registered to the specified node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/attributes) |
| readonly `attributeStyleMap` | `StylePropertyMap` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/attributeStyleMap) |
| `autocapitalize` | `string` | The **`autocapitalize`** property of the HTMLElement interface represents the element's capitalization behavior for user input.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/autocapitalize) |
| `autocorrect` | `boolean` | The **`autocorrect`** property of the HTMLElement interface controls whether or not autocorrection of editable text is enabled for spelling and/or punctuation errors.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/autocorrect) |
| `autofocus` | `boolean` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/autofocus) |
| readonly `baseURI` | `string` | The read-only **`baseURI`** property of the Node interface returns the absolute base URL of the document containing the node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/baseURI) |
| readonly `CDATA_SECTION_NODE` | `4` | node is a CDATASection node. |
| readonly `childElementCount` | `number` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/childElementCount) |
| readonly `childNodes` | `NodeListOf<ChildNode>` | The read-only **`childNodes`** property of the Node interface returns a live the first child node is assigned index `0`.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/childNodes) |
| readonly `children` | `HTMLCollection` | Returns the child elements.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/children) |
| `className` | `string` | The **`className`** property of the of the specified element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/className) |
| readonly `clientHeight` | `number` | The **`clientHeight`** read-only property of the Element interface is zero for elements with no CSS or inline layout boxes; otherwise, it's the inner height of an element in pixels.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/clientHeight) |
| readonly `clientLeft` | `number` | The **`clientLeft`** read-only property of the Element interface returns the width of the left border of an element in pixels.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/clientLeft) |
| readonly `clientTop` | `number` | The **`clientTop`** read-only property of the Element interface returns the width of the top border of an element in pixels.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/clientTop) |
| readonly `clientWidth` | `number` | The **`clientWidth`** read-only property of the Element interface is zero for inline elements and elements with no CSS; otherwise, it's the inner width of an element in pixels.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/clientWidth) |
| readonly `COMMENT_NODE` | `8` | node is a Comment node. |
| `contentEditable` | `string` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/contentEditable) |
| readonly `currentCSSZoom` | `number` | The **`currentCSSZoom`** read-only property of the Element interface provides the 'effective' CSS `zoom` of an element, taking into account the zoom applied to the element and all its parent elements.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/currentCSSZoom) |
| readonly `dataset` | `DOMStringMap` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dataset) |
| `dir` | `string` | The **`HTMLElement.dir`** property indicates the text writing directionality of the content of the current element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dir) |
| readonly `DOCUMENT_FRAGMENT_NODE` | `11` | node is a DocumentFragment node. |
| readonly `DOCUMENT_NODE` | `9` | node is a document. |
| readonly `DOCUMENT_POSITION_CONTAINED_BY` | `16` | Set when other is a descendant of node. |
| readonly `DOCUMENT_POSITION_CONTAINS` | `8` | Set when other is an ancestor of node. |
| readonly `DOCUMENT_POSITION_DISCONNECTED` | `1` | Set when node and other are not in the same tree. |
| readonly `DOCUMENT_POSITION_FOLLOWING` | `4` | Set when other is following node. |
| readonly `DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC` | `32` | — |
| readonly `DOCUMENT_POSITION_PRECEDING` | `2` | Set when other is preceding node. |
| readonly `DOCUMENT_TYPE_NODE` | `10` | node is a doctype. |
| `draggable` | `boolean` | The **`draggable`** property of the HTMLElement interface gets and sets a Boolean primitive indicating if the element is draggable.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/draggable) |
| readonly `ELEMENT_NODE` | `1` | node is an element. |
| `enterKeyHint` | `string` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/enterKeyHint) |
| readonly `ENTITY_NODE` | `6` | — |
| readonly `ENTITY_REFERENCE_NODE` | `5` | — |
| readonly `firstChild` | `ChildNode | null` | The read-only **`firstChild`** property of the Node interface returns the node's first child in the tree, or `null` if the node has no children.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/firstChild) |
| readonly `firstElementChild` | `Element | null` | Returns the first child that is an element, and null otherwise.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/firstElementChild) |
| `hidden` | `boolean` | The HTMLElement property **`hidden`** reflects the value of the element's `hidden` attribute.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/hidden) |
| `id` | `string` | The **`id`** property of the Element interface represents the element's identifier, reflecting the **`id`** global attribute.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/id) |
| `inert` | `boolean` | The HTMLElement property **`inert`** reflects the value of the element's `inert` attribute.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/inert) |
| `innerHTML` | `string` | The **`innerHTML`** property of the Element interface gets or sets the HTML or XML markup contained within the element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/innerHTML) |
| `innerText` | `string` | The **`innerText`** property of the HTMLElement interface represents the rendered text content of a node and its descendants.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/innerText) |
| `inputMode` | `string` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/inputMode) |
| readonly `isConnected` | `boolean` | The read-only **`isConnected`** property of the Node interface returns a boolean indicating whether the node is connected (directly or indirectly) to a Document object.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/isConnected) |
| readonly `isContentEditable` | `boolean` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/isContentEditable) |
| `lang` | `string` | The **`lang`** property of the HTMLElement interface indicates the base language of an element's attribute values and text content, in the form of a MISSING: RFC(5646, 'BCP 47 language identifier tag')].

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/lang) |
| readonly `lastChild` | `ChildNode | null` | The read-only **`lastChild`** property of the Node interface returns the last child of the node, or `null` if there are no child nodes.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/lastChild) |
| readonly `lastElementChild` | `Element | null` | Returns the last child that is an element, and null otherwise.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/lastElementChild) |
| readonly `localName` | `string` | The **`Element.localName`** read-only property returns the local part of the qualified name of an element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/localName) |
| readonly `namespaceURI` | `string | null` | The **`Element.namespaceURI`** read-only property returns the namespace URI of the element, or `null` if the element is not in a namespace.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/namespaceURI) |
| readonly `nextElementSibling` | `Element | null` | Returns the first following sibling that is an element, and null otherwise.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/nextElementSibling) |
| readonly `nextSibling` | `ChildNode | null` | The read-only **`nextSibling`** property of the Node interface returns the node immediately following the specified one in their parent's Node.childNodes, or returns `null` if the specified node is the last child in the parent element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nextSibling) |
| readonly `nodeName` | `string` | The read-only **`nodeName`** property of Node returns the name of the current node as a string.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nodeName) |
| readonly `nodeType` | `number` | The read-only **`nodeType`** property of a Node interface is an integer that identifies what the node is.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nodeType) |
| `nodeValue` | `string | null` | The **`nodeValue`** property of the Node interface returns or sets the value of the current node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nodeValue) |
| `nonce` (optional) | `string` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/nonce) |
| readonly `NOTATION_NODE` | `12` | — |
| readonly `offsetHeight` | `number` | The **`offsetHeight`** read-only property of the HTMLElement interface returns the height of an element, including vertical padding and borders, as an integer.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetHeight) |
| readonly `offsetLeft` | `number` | The **`offsetLeft`** read-only property of the HTMLElement interface returns the number of pixels that the _upper left corner_ of the current element is offset to the left within the HTMLElement.offsetParent node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetLeft) |
| readonly `offsetParent` | `Element | null` | The **`HTMLElement.offsetParent`** read-only property returns a reference to the element which is the closest (nearest in the containment hierarchy) positioned ancestor element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetParent) |
| readonly `offsetTop` | `number` | The **`offsetTop`** read-only property of the HTMLElement interface returns the distance from the outer border of the current element (including its margin) to the top padding edge of the HTMLelement.offsetParent, the _closest positioned_ ancestor element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetTop) |
| readonly `offsetWidth` | `number` | The **`offsetWidth`** read-only property of the HTMLElement interface returns the layout width of an element as an integer.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetWidth) |
| `onabort` | `__type(this: GlobalEventHandlers, ev: UIEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/abort_event) |
| `onanimationcancel` | `__type(this: GlobalEventHandlers, ev: AnimationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/animationcancel_event) |
| `onanimationend` | `__type(this: GlobalEventHandlers, ev: AnimationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/animationend_event) |
| `onanimationiteration` | `__type(this: GlobalEventHandlers, ev: AnimationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/animationiteration_event) |
| `onanimationstart` | `__type(this: GlobalEventHandlers, ev: AnimationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/animationstart_event) |
| `onauxclick` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/auxclick_event) |
| `onbeforeinput` | `__type(this: GlobalEventHandlers, ev: InputEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/beforeinput_event) |
| `onbeforematch` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/beforematch_event) |
| `onbeforetoggle` | `__type(this: GlobalEventHandlers, ev: ToggleEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/beforetoggle_event) |
| `onblur` | `__type(this: GlobalEventHandlers, ev: FocusEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/blur_event) |
| `oncancel` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLDialogElement/cancel_event) |
| `oncanplay` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/canplay_event) |
| `oncanplaythrough` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/canplaythrough_event) |
| `onchange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/change_event) |
| `onclick` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/click_event) |
| `onclose` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLDialogElement/close_event) |
| `oncontextlost` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/contextlost_event) |
| `oncontextmenu` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/contextmenu_event) |
| `oncontextrestored` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/contextrestored_event) |
| `oncopy` | `__type(this: GlobalEventHandlers, ev: ClipboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/copy_event) |
| `oncuechange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLTrackElement/cuechange_event) |
| `oncut` | `__type(this: GlobalEventHandlers, ev: ClipboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/cut_event) |
| `ondblclick` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/dblclick_event) |
| `ondrag` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/drag_event) |
| `ondragend` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragend_event) |
| `ondragenter` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragenter_event) |
| `ondragleave` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragleave_event) |
| `ondragover` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragover_event) |
| `ondragstart` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragstart_event) |
| `ondrop` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/drop_event) |
| `ondurationchange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/durationchange_event) |
| `onemptied` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/emptied_event) |
| `onended` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/ended_event) |
| `onerror` | `OnErrorEventHandler` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/error_event) |
| `onfocus` | `__type(this: GlobalEventHandlers, ev: FocusEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/focus_event) |
| `onformdata` | `__type(this: GlobalEventHandlers, ev: FormDataEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLFormElement/formdata_event) |
| `onfullscreenchange` | `__type(this: Element, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/fullscreenchange_event) |
| `onfullscreenerror` | `__type(this: Element, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/fullscreenerror_event) |
| `ongotpointercapture` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/gotpointercapture_event) |
| `oninput` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/input_event) |
| `oninvalid` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLInputElement/invalid_event) |
| `onkeydown` | `__type(this: GlobalEventHandlers, ev: KeyboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/keydown_event) |
| `onkeypress` | `__type(this: GlobalEventHandlers, ev: KeyboardEvent): any | null` | — |
| `onkeyup` | `__type(this: GlobalEventHandlers, ev: KeyboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/keyup_event) |
| `onload` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/load_event) |
| `onloadeddata` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/loadeddata_event) |
| `onloadedmetadata` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/loadedmetadata_event) |
| `onloadstart` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/loadstart_event) |
| `onlostpointercapture` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/lostpointercapture_event) |
| `onmousedown` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mousedown_event) |
| `onmouseenter` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseenter_event) |
| `onmouseleave` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseleave_event) |
| `onmousemove` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mousemove_event) |
| `onmouseout` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseout_event) |
| `onmouseover` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseover_event) |
| `onmouseup` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseup_event) |
| `onpaste` | `__type(this: GlobalEventHandlers, ev: ClipboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/paste_event) |
| `onpause` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/pause_event) |
| `onplay` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/play_event) |
| `onplaying` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/playing_event) |
| `onpointercancel` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointercancel_event) |
| `onpointerdown` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event) |
| `onpointerenter` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event) |
| `onpointerleave` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event) |
| `onpointermove` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointermove_event) |
| `onpointerout` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerout_event) |
| `onpointerover` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerover_event) |
| `onpointerrawupdate` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | Available only in secure contexts.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerrawupdate_event) |
| `onpointerup` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event) |
| `onprogress` | `__type(this: GlobalEventHandlers, ev: ProgressEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/progress_event) |
| `onratechange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/ratechange_event) |
| `onreset` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLFormElement/reset_event) |
| `onresize` | `__type(this: GlobalEventHandlers, ev: UIEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLVideoElement/resize_event) |
| `onscroll` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/scroll_event) |
| `onscrollend` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/scrollend_event) |
| `onsecuritypolicyviolation` | `__type(this: GlobalEventHandlers, ev: SecurityPolicyViolationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/securitypolicyviolation_event) |
| `onseeked` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/seeked_event) |
| `onseeking` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/seeking_event) |
| `onselect` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLInputElement/select_event) |
| `onselectionchange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/selectionchange_event) |
| `onselectstart` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/selectstart_event) |
| `onslotchange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLSlotElement/slotchange_event) |
| `onstalled` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/stalled_event) |
| `onsubmit` | `__type(this: GlobalEventHandlers, ev: SubmitEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLFormElement/submit_event) |
| `onsuspend` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/suspend_event) |
| `ontimeupdate` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/timeupdate_event) |
| `ontoggle` | `__type(this: GlobalEventHandlers, ev: ToggleEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/toggle_event) |
| `ontouchcancel` (optional) | `__type(this: GlobalEventHandlers, ev: TouchEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/touchcancel_event) |
| `ontouchend` (optional) | `__type(this: GlobalEventHandlers, ev: TouchEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/touchend_event) |
| `ontouchmove` (optional) | `__type(this: GlobalEventHandlers, ev: TouchEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/touchmove_event) |
| `ontouchstart` (optional) | `__type(this: GlobalEventHandlers, ev: TouchEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/touchstart_event) |
| `ontransitioncancel` | `__type(this: GlobalEventHandlers, ev: TransitionEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/transitioncancel_event) |
| `ontransitionend` | `__type(this: GlobalEventHandlers, ev: TransitionEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/transitionend_event) |
| `ontransitionrun` | `__type(this: GlobalEventHandlers, ev: TransitionEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/transitionrun_event) |
| `ontransitionstart` | `__type(this: GlobalEventHandlers, ev: TransitionEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/transitionstart_event) |
| `onvolumechange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/volumechange_event) |
| `onwaiting` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/waiting_event) |
| `onwebkitanimationend` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | — |
| `onwebkitanimationiteration` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | — |
| `onwebkitanimationstart` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | — |
| `onwebkittransitionend` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | — |
| `onwheel` | `__type(this: GlobalEventHandlers, ev: WheelEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/wheel_event) |
| `outerHTML` | `string` | The **`outerHTML`** attribute of the Element DOM interface gets the serialized HTML fragment describing the element including its descendants.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/outerHTML) |
| `outerText` | `string` | The **`outerText`** property of the HTMLElement interface returns the same value as HTMLElement.innerText.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/outerText) |
| readonly `ownerDocument` | `Document` | The read-only **`ownerDocument`** property of the Node interface returns the top-level document object of the node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/ownerDocument) |
| readonly `parentElement` | `HTMLElement | null` | The read-only **`parentElement`** property of Node interface returns the DOM node's parent Element, or `null` if the node either has no parent, or its parent isn't a DOM Element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/parentElement) |
| readonly `parentNode` | `ParentNode | null` | The read-only **`parentNode`** property of the Node interface returns the parent of the specified node in the DOM tree.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/parentNode) |
| `popover` | `string | null` | The **`popover`** property of the HTMLElement interface gets and sets an element's popover state via JavaScript (`'auto'`, `'hint'`, or `'manual'`), and can be used for feature detection.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/popover) |
| readonly `prefix` | `string | null` | The **`Element.prefix`** read-only property returns the namespace prefix of the specified element, or `null` if no prefix is specified.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/prefix) |
| readonly `previousElementSibling` | `Element | null` | Returns the first preceding sibling that is an element, and null otherwise.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/previousElementSibling) |
| readonly `previousSibling` | `ChildNode | null` | The read-only **`previousSibling`** property of the Node interface returns the node immediately preceding the specified one in its parent's or `null` if the specified node is the first in that list.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/previousSibling) |
| readonly `PROCESSING_INSTRUCTION_NODE` | `7` | node is a ProcessingInstruction node. |
| `role` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/role) |
| readonly `scrollHeight` | `number` | The **`scrollHeight`** read-only property of the Element interface is a measurement of the height of an element's content, including content not visible on the screen due to overflow.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollHeight) |
| `scrollLeft` | `number` | The **`scrollLeft`** property of the Element interface gets or sets the number of pixels by which an element's content is scrolled from its left edge.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollLeft) |
| `scrollTop` | `number` | The **`scrollTop`** property of the Element interface gets or sets the number of pixels by which an element's content is scrolled from its top edge.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollTop) |
| readonly `scrollWidth` | `number` | The **`scrollWidth`** read-only property of the Element interface is a measurement of the width of an element's content, including content not visible on the screen due to overflow.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollWidth) |
| readonly `shadowRoot` | `ShadowRoot | null` | The `Element.shadowRoot` read-only property represents the shadow root hosted by the element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/shadowRoot) |
| `slot` | `string` | The **`slot`** property of the Element interface returns the name of the shadow DOM slot the element is inserted in.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/slot) |
| `spellcheck` | `boolean` | The **`spellcheck`** property of the HTMLElement interface represents a boolean value that controls the spell-checking hint.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/spellcheck) |
| `tabIndex` | `number` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/tabIndex) |
| readonly `tagName` | `string` | The **`tagName`** read-only property of the Element interface returns the tag name of the element on which it's called.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/tagName) |
| readonly `TEXT_NODE` | `3` | node is a Text node. |
| `title` | `string` | The **`HTMLElement.title`** property represents the title of the element: the text usually displayed in a 'tooltip' popup when the mouse is over the node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/title) |
| `translate` | `boolean` | The **`translate`** property of the HTMLElement interface indicates whether an element's attribute values and the values of its Text node children are to be translated when the page is localized, or whether to leave them unchanged.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/translate) |
| `writingSuggestions` | `string` | The **`writingSuggestions`** property of the HTMLElement interface is a string indicating if browser-provided writing suggestions should be enabled under the scope of the element or not.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/writingSuggestions) |
| `observedAttributes` | `string[]` | — |
| `classList` | `void` | — |
| `part` | `void` | — |
| `style` | `void` | — |
| `textContent` | `void` | — |
| `addEventListener` | `void` | — |
| `after` | `void` | — |
| `animate` | `Animation` | — |
| `append` | `void` | — |
| `appendChild` | `T` | — |
| `attachInternals` | `ElementInternals` | — |
| `attachShadow` | `ShadowRoot` | — |
| `attributeChangedCallback` | `void` | — |
| `before` | `void` | — |
| `blur` | `void` | — |
| `checkVisibility` | `boolean` | — |
| `click` | `void` | — |
| `cloneNode` | `Node` | — |
| `closest` | `HTMLElementTagNameMap[K] | null` | — |
| `compareDocumentPosition` | `number` | — |
| `computedStyleMap` | `StylePropertyMapReadOnly` | — |
| `connectedCallback` | `void` | — |
| `contains` | `boolean` | — |
| `disconnectedCallback` | `void` | — |
| `dispatchEvent` | `boolean` | — |
| `focus` | `void` | — |
| `getAnimations` | `Animation[]` | — |
| `getAttribute` | `string | null` | — |
| `getAttributeNames` | `string[]` | — |
| `getAttributeNode` | `Attr | null` | — |
| `getAttributeNodeNS` | `Attr | null` | — |
| `getAttributeNS` | `string | null` | — |
| `getBoundingClientRect` | `DOMRect` | — |
| `getClientRects` | `DOMRectList` | — |
| `getElementsByClassName` | `HTMLCollectionOf<Element>` | — |
| `getElementsByTagName` | `HTMLCollectionOf<HTMLElementTagNameMap[K]>` | — |
| `getElementsByTagNameNS` | `HTMLCollectionOf<HTMLElement>` | — |
| `getHTML` | `string` | — |
| `getRootNode` | `Node` | — |
| `hasAttribute` | `boolean` | — |
| `hasAttributeNS` | `boolean` | — |
| `hasAttributes` | `boolean` | — |
| `hasChildNodes` | `boolean` | — |
| `hasPointerCapture` | `boolean` | — |
| `hidePopover` | `void` | — |
| `insertAdjacentElement` | `Element | null` | — |
| `insertAdjacentHTML` | `void` | — |
| `insertAdjacentText` | `void` | — |
| `insertBefore` | `T` | — |
| `isDefaultNamespace` | `boolean` | — |
| `isEqualNode` | `boolean` | — |
| `isSameNode` | `boolean` | — |
| `lookupNamespaceURI` | `string | null` | — |
| `lookupPrefix` | `string | null` | — |
| `matches` | `boolean` | — |
| `normalize` | `void` | — |
| `prepend` | `void` | — |
| `querySelector` | `HTMLElementTagNameMap[K] | null` | — |
| `querySelectorAll` | `NodeListOf<HTMLElementTagNameMap[K]>` | — |
| `releasePointerCapture` | `void` | — |
| `remove` | `void` | — |
| `removeAttribute` | `void` | — |
| `removeAttributeNode` | `Attr` | — |
| `removeAttributeNS` | `void` | — |
| `removeChild` | `T` | — |
| `removeEventListener` | `void` | — |
| `replaceChild` | `T` | — |
| `replaceChildren` | `void` | — |
| `replaceWith` | `void` | — |
| `requestFullscreen` | `Promise<void>` | — |
| `requestPointerLock` | `Promise<void>` | — |
| `scroll` | `void` | — |
| `scrollBy` | `void` | — |
| `scrollIntoView` | `void` | — |
| `scrollTo` | `void` | — |
| `setAttribute` | `void` | — |
| `setAttributeNode` | `Attr | null` | — |
| `setAttributeNodeNS` | `Attr | null` | — |
| `setAttributeNS` | `void` | — |
| `setHTMLUnsafe` | `void` | — |
| `setPointerCapture` | `void` | — |
| `showPopover` | `void` | — |
| `toggleAttribute` | `boolean` | — |
| `togglePopover` | `boolean` | — |
| `webkitMatchesSelector` | `boolean` | — |
| `define` | `void` | — |

---


### `class ThemeKitProvider`

**Extends** `HTMLElement`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `constructor` | `ThemeKitProvider` | — |
| `accessKey` | `string` | The **`HTMLElement.accessKey`** property sets the keystroke which a user can press to jump to a given element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/accessKey) |
| readonly `accessKeyLabel` | `string` | The **`HTMLElement.accessKeyLabel`** read-only property returns a string containing the element's browser-assigned access key (if any); otherwise it returns an empty string.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/accessKeyLabel) |
| `ariaActiveDescendantElement` | `Element | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaActiveDescendantElement) |
| `ariaAtomic` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaAtomic) |
| `ariaAutoComplete` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaAutoComplete) |
| `ariaBrailleLabel` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaBrailleLabel) |
| `ariaBrailleRoleDescription` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaBrailleRoleDescription) |
| `ariaBusy` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaBusy) |
| `ariaChecked` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaChecked) |
| `ariaColCount` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaColCount) |
| `ariaColIndex` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaColIndex) |
| `ariaColIndexText` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaColIndexText) |
| `ariaColSpan` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaColSpan) |
| `ariaControlsElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaControlsElements) |
| `ariaCurrent` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaCurrent) |
| `ariaDescribedByElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaDescribedByElements) |
| `ariaDescription` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaDescription) |
| `ariaDetailsElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaDetailsElements) |
| `ariaDisabled` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaDisabled) |
| `ariaErrorMessageElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaErrorMessageElements) |
| `ariaExpanded` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaExpanded) |
| `ariaFlowToElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaFlowToElements) |
| `ariaHasPopup` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaHasPopup) |
| `ariaHidden` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaHidden) |
| `ariaInvalid` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaInvalid) |
| `ariaKeyShortcuts` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaKeyShortcuts) |
| `ariaLabel` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaLabel) |
| `ariaLabelledByElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaLabelledByElements) |
| `ariaLevel` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaLevel) |
| `ariaLive` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaLive) |
| `ariaModal` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaModal) |
| `ariaMultiLine` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaMultiLine) |
| `ariaMultiSelectable` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaMultiSelectable) |
| `ariaOrientation` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaOrientation) |
| `ariaOwnsElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaOwnsElements) |
| `ariaPlaceholder` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaPlaceholder) |
| `ariaPosInSet` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaPosInSet) |
| `ariaPressed` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaPressed) |
| `ariaReadOnly` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaReadOnly) |
| `ariaRelevant` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRelevant) |
| `ariaRequired` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRequired) |
| `ariaRoleDescription` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRoleDescription) |
| `ariaRowCount` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRowCount) |
| `ariaRowIndex` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRowIndex) |
| `ariaRowIndexText` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRowIndexText) |
| `ariaRowSpan` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRowSpan) |
| `ariaSelected` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaSelected) |
| `ariaSetSize` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaSetSize) |
| `ariaSort` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaSort) |
| `ariaValueMax` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaValueMax) |
| `ariaValueMin` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaValueMin) |
| `ariaValueNow` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaValueNow) |
| `ariaValueText` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaValueText) |
| readonly `assignedSlot` | `HTMLSlotElement | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/assignedSlot) |
| readonly `ATTRIBUTE_NODE` | `2` | — |
| readonly `attributes` | `NamedNodeMap` | The **`Element.attributes`** property returns a live collection of all attribute nodes registered to the specified node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/attributes) |
| readonly `attributeStyleMap` | `StylePropertyMap` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/attributeStyleMap) |
| `autocapitalize` | `string` | The **`autocapitalize`** property of the HTMLElement interface represents the element's capitalization behavior for user input.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/autocapitalize) |
| `autocorrect` | `boolean` | The **`autocorrect`** property of the HTMLElement interface controls whether or not autocorrection of editable text is enabled for spelling and/or punctuation errors.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/autocorrect) |
| `autofocus` | `boolean` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/autofocus) |
| readonly `baseURI` | `string` | The read-only **`baseURI`** property of the Node interface returns the absolute base URL of the document containing the node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/baseURI) |
| readonly `CDATA_SECTION_NODE` | `4` | node is a CDATASection node. |
| readonly `childElementCount` | `number` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/childElementCount) |
| readonly `childNodes` | `NodeListOf<ChildNode>` | The read-only **`childNodes`** property of the Node interface returns a live the first child node is assigned index `0`.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/childNodes) |
| readonly `children` | `HTMLCollection` | Returns the child elements.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/children) |
| `className` | `string` | The **`className`** property of the of the specified element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/className) |
| readonly `clientHeight` | `number` | The **`clientHeight`** read-only property of the Element interface is zero for elements with no CSS or inline layout boxes; otherwise, it's the inner height of an element in pixels.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/clientHeight) |
| readonly `clientLeft` | `number` | The **`clientLeft`** read-only property of the Element interface returns the width of the left border of an element in pixels.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/clientLeft) |
| readonly `clientTop` | `number` | The **`clientTop`** read-only property of the Element interface returns the width of the top border of an element in pixels.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/clientTop) |
| readonly `clientWidth` | `number` | The **`clientWidth`** read-only property of the Element interface is zero for inline elements and elements with no CSS; otherwise, it's the inner width of an element in pixels.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/clientWidth) |
| readonly `COMMENT_NODE` | `8` | node is a Comment node. |
| `contentEditable` | `string` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/contentEditable) |
| readonly `currentCSSZoom` | `number` | The **`currentCSSZoom`** read-only property of the Element interface provides the 'effective' CSS `zoom` of an element, taking into account the zoom applied to the element and all its parent elements.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/currentCSSZoom) |
| readonly `dataset` | `DOMStringMap` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dataset) |
| `dir` | `string` | The **`HTMLElement.dir`** property indicates the text writing directionality of the content of the current element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dir) |
| readonly `DOCUMENT_FRAGMENT_NODE` | `11` | node is a DocumentFragment node. |
| readonly `DOCUMENT_NODE` | `9` | node is a document. |
| readonly `DOCUMENT_POSITION_CONTAINED_BY` | `16` | Set when other is a descendant of node. |
| readonly `DOCUMENT_POSITION_CONTAINS` | `8` | Set when other is an ancestor of node. |
| readonly `DOCUMENT_POSITION_DISCONNECTED` | `1` | Set when node and other are not in the same tree. |
| readonly `DOCUMENT_POSITION_FOLLOWING` | `4` | Set when other is following node. |
| readonly `DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC` | `32` | — |
| readonly `DOCUMENT_POSITION_PRECEDING` | `2` | Set when other is preceding node. |
| readonly `DOCUMENT_TYPE_NODE` | `10` | node is a doctype. |
| `draggable` | `boolean` | The **`draggable`** property of the HTMLElement interface gets and sets a Boolean primitive indicating if the element is draggable.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/draggable) |
| readonly `ELEMENT_NODE` | `1` | node is an element. |
| `enterKeyHint` | `string` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/enterKeyHint) |
| readonly `ENTITY_NODE` | `6` | — |
| readonly `ENTITY_REFERENCE_NODE` | `5` | — |
| readonly `firstChild` | `ChildNode | null` | The read-only **`firstChild`** property of the Node interface returns the node's first child in the tree, or `null` if the node has no children.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/firstChild) |
| readonly `firstElementChild` | `Element | null` | Returns the first child that is an element, and null otherwise.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/firstElementChild) |
| `hidden` | `boolean` | The HTMLElement property **`hidden`** reflects the value of the element's `hidden` attribute.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/hidden) |
| `id` | `string` | The **`id`** property of the Element interface represents the element's identifier, reflecting the **`id`** global attribute.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/id) |
| `inert` | `boolean` | The HTMLElement property **`inert`** reflects the value of the element's `inert` attribute.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/inert) |
| `innerHTML` | `string` | The **`innerHTML`** property of the Element interface gets or sets the HTML or XML markup contained within the element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/innerHTML) |
| `innerText` | `string` | The **`innerText`** property of the HTMLElement interface represents the rendered text content of a node and its descendants.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/innerText) |
| `inputMode` | `string` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/inputMode) |
| readonly `isConnected` | `boolean` | The read-only **`isConnected`** property of the Node interface returns a boolean indicating whether the node is connected (directly or indirectly) to a Document object.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/isConnected) |
| readonly `isContentEditable` | `boolean` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/isContentEditable) |
| `lang` | `string` | The **`lang`** property of the HTMLElement interface indicates the base language of an element's attribute values and text content, in the form of a MISSING: RFC(5646, 'BCP 47 language identifier tag')].

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/lang) |
| readonly `lastChild` | `ChildNode | null` | The read-only **`lastChild`** property of the Node interface returns the last child of the node, or `null` if there are no child nodes.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/lastChild) |
| readonly `lastElementChild` | `Element | null` | Returns the last child that is an element, and null otherwise.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/lastElementChild) |
| readonly `localName` | `string` | The **`Element.localName`** read-only property returns the local part of the qualified name of an element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/localName) |
| readonly `namespaceURI` | `string | null` | The **`Element.namespaceURI`** read-only property returns the namespace URI of the element, or `null` if the element is not in a namespace.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/namespaceURI) |
| readonly `nextElementSibling` | `Element | null` | Returns the first following sibling that is an element, and null otherwise.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/nextElementSibling) |
| readonly `nextSibling` | `ChildNode | null` | The read-only **`nextSibling`** property of the Node interface returns the node immediately following the specified one in their parent's Node.childNodes, or returns `null` if the specified node is the last child in the parent element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nextSibling) |
| readonly `nodeName` | `string` | The read-only **`nodeName`** property of Node returns the name of the current node as a string.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nodeName) |
| readonly `nodeType` | `number` | The read-only **`nodeType`** property of a Node interface is an integer that identifies what the node is.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nodeType) |
| `nodeValue` | `string | null` | The **`nodeValue`** property of the Node interface returns or sets the value of the current node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nodeValue) |
| `nonce` (optional) | `string` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/nonce) |
| readonly `NOTATION_NODE` | `12` | — |
| readonly `offsetHeight` | `number` | The **`offsetHeight`** read-only property of the HTMLElement interface returns the height of an element, including vertical padding and borders, as an integer.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetHeight) |
| readonly `offsetLeft` | `number` | The **`offsetLeft`** read-only property of the HTMLElement interface returns the number of pixels that the _upper left corner_ of the current element is offset to the left within the HTMLElement.offsetParent node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetLeft) |
| readonly `offsetParent` | `Element | null` | The **`HTMLElement.offsetParent`** read-only property returns a reference to the element which is the closest (nearest in the containment hierarchy) positioned ancestor element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetParent) |
| readonly `offsetTop` | `number` | The **`offsetTop`** read-only property of the HTMLElement interface returns the distance from the outer border of the current element (including its margin) to the top padding edge of the HTMLelement.offsetParent, the _closest positioned_ ancestor element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetTop) |
| readonly `offsetWidth` | `number` | The **`offsetWidth`** read-only property of the HTMLElement interface returns the layout width of an element as an integer.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetWidth) |
| `onabort` | `__type(this: GlobalEventHandlers, ev: UIEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/abort_event) |
| `onanimationcancel` | `__type(this: GlobalEventHandlers, ev: AnimationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/animationcancel_event) |
| `onanimationend` | `__type(this: GlobalEventHandlers, ev: AnimationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/animationend_event) |
| `onanimationiteration` | `__type(this: GlobalEventHandlers, ev: AnimationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/animationiteration_event) |
| `onanimationstart` | `__type(this: GlobalEventHandlers, ev: AnimationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/animationstart_event) |
| `onauxclick` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/auxclick_event) |
| `onbeforeinput` | `__type(this: GlobalEventHandlers, ev: InputEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/beforeinput_event) |
| `onbeforematch` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/beforematch_event) |
| `onbeforetoggle` | `__type(this: GlobalEventHandlers, ev: ToggleEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/beforetoggle_event) |
| `onblur` | `__type(this: GlobalEventHandlers, ev: FocusEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/blur_event) |
| `oncancel` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLDialogElement/cancel_event) |
| `oncanplay` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/canplay_event) |
| `oncanplaythrough` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/canplaythrough_event) |
| `onchange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/change_event) |
| `onclick` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/click_event) |
| `onclose` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLDialogElement/close_event) |
| `oncontextlost` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/contextlost_event) |
| `oncontextmenu` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/contextmenu_event) |
| `oncontextrestored` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/contextrestored_event) |
| `oncopy` | `__type(this: GlobalEventHandlers, ev: ClipboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/copy_event) |
| `oncuechange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLTrackElement/cuechange_event) |
| `oncut` | `__type(this: GlobalEventHandlers, ev: ClipboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/cut_event) |
| `ondblclick` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/dblclick_event) |
| `ondrag` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/drag_event) |
| `ondragend` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragend_event) |
| `ondragenter` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragenter_event) |
| `ondragleave` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragleave_event) |
| `ondragover` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragover_event) |
| `ondragstart` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragstart_event) |
| `ondrop` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/drop_event) |
| `ondurationchange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/durationchange_event) |
| `onemptied` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/emptied_event) |
| `onended` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/ended_event) |
| `onerror` | `OnErrorEventHandler` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/error_event) |
| `onfocus` | `__type(this: GlobalEventHandlers, ev: FocusEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/focus_event) |
| `onformdata` | `__type(this: GlobalEventHandlers, ev: FormDataEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLFormElement/formdata_event) |
| `onfullscreenchange` | `__type(this: Element, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/fullscreenchange_event) |
| `onfullscreenerror` | `__type(this: Element, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/fullscreenerror_event) |
| `ongotpointercapture` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/gotpointercapture_event) |
| `oninput` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/input_event) |
| `oninvalid` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLInputElement/invalid_event) |
| `onkeydown` | `__type(this: GlobalEventHandlers, ev: KeyboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/keydown_event) |
| `onkeypress` | `__type(this: GlobalEventHandlers, ev: KeyboardEvent): any | null` | — |
| `onkeyup` | `__type(this: GlobalEventHandlers, ev: KeyboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/keyup_event) |
| `onload` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/load_event) |
| `onloadeddata` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/loadeddata_event) |
| `onloadedmetadata` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/loadedmetadata_event) |
| `onloadstart` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/loadstart_event) |
| `onlostpointercapture` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/lostpointercapture_event) |
| `onmousedown` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mousedown_event) |
| `onmouseenter` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseenter_event) |
| `onmouseleave` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseleave_event) |
| `onmousemove` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mousemove_event) |
| `onmouseout` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseout_event) |
| `onmouseover` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseover_event) |
| `onmouseup` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseup_event) |
| `onpaste` | `__type(this: GlobalEventHandlers, ev: ClipboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/paste_event) |
| `onpause` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/pause_event) |
| `onplay` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/play_event) |
| `onplaying` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/playing_event) |
| `onpointercancel` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointercancel_event) |
| `onpointerdown` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event) |
| `onpointerenter` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event) |
| `onpointerleave` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event) |
| `onpointermove` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointermove_event) |
| `onpointerout` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerout_event) |
| `onpointerover` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerover_event) |
| `onpointerrawupdate` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | Available only in secure contexts.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerrawupdate_event) |
| `onpointerup` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event) |
| `onprogress` | `__type(this: GlobalEventHandlers, ev: ProgressEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/progress_event) |
| `onratechange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/ratechange_event) |
| `onreset` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLFormElement/reset_event) |
| `onresize` | `__type(this: GlobalEventHandlers, ev: UIEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLVideoElement/resize_event) |
| `onscroll` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/scroll_event) |
| `onscrollend` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/scrollend_event) |
| `onsecuritypolicyviolation` | `__type(this: GlobalEventHandlers, ev: SecurityPolicyViolationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/securitypolicyviolation_event) |
| `onseeked` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/seeked_event) |
| `onseeking` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/seeking_event) |
| `onselect` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLInputElement/select_event) |
| `onselectionchange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/selectionchange_event) |
| `onselectstart` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/selectstart_event) |
| `onslotchange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLSlotElement/slotchange_event) |
| `onstalled` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/stalled_event) |
| `onsubmit` | `__type(this: GlobalEventHandlers, ev: SubmitEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLFormElement/submit_event) |
| `onsuspend` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/suspend_event) |
| `ontimeupdate` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/timeupdate_event) |
| `ontoggle` | `__type(this: GlobalEventHandlers, ev: ToggleEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/toggle_event) |
| `ontouchcancel` (optional) | `__type(this: GlobalEventHandlers, ev: TouchEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/touchcancel_event) |
| `ontouchend` (optional) | `__type(this: GlobalEventHandlers, ev: TouchEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/touchend_event) |
| `ontouchmove` (optional) | `__type(this: GlobalEventHandlers, ev: TouchEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/touchmove_event) |
| `ontouchstart` (optional) | `__type(this: GlobalEventHandlers, ev: TouchEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/touchstart_event) |
| `ontransitioncancel` | `__type(this: GlobalEventHandlers, ev: TransitionEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/transitioncancel_event) |
| `ontransitionend` | `__type(this: GlobalEventHandlers, ev: TransitionEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/transitionend_event) |
| `ontransitionrun` | `__type(this: GlobalEventHandlers, ev: TransitionEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/transitionrun_event) |
| `ontransitionstart` | `__type(this: GlobalEventHandlers, ev: TransitionEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/transitionstart_event) |
| `onvolumechange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/volumechange_event) |
| `onwaiting` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/waiting_event) |
| `onwebkitanimationend` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | — |
| `onwebkitanimationiteration` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | — |
| `onwebkitanimationstart` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | — |
| `onwebkittransitionend` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | — |
| `onwheel` | `__type(this: GlobalEventHandlers, ev: WheelEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/wheel_event) |
| `outerHTML` | `string` | The **`outerHTML`** attribute of the Element DOM interface gets the serialized HTML fragment describing the element including its descendants.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/outerHTML) |
| `outerText` | `string` | The **`outerText`** property of the HTMLElement interface returns the same value as HTMLElement.innerText.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/outerText) |
| readonly `ownerDocument` | `Document` | The read-only **`ownerDocument`** property of the Node interface returns the top-level document object of the node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/ownerDocument) |
| readonly `parentElement` | `HTMLElement | null` | The read-only **`parentElement`** property of Node interface returns the DOM node's parent Element, or `null` if the node either has no parent, or its parent isn't a DOM Element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/parentElement) |
| readonly `parentNode` | `ParentNode | null` | The read-only **`parentNode`** property of the Node interface returns the parent of the specified node in the DOM tree.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/parentNode) |
| `popover` | `string | null` | The **`popover`** property of the HTMLElement interface gets and sets an element's popover state via JavaScript (`'auto'`, `'hint'`, or `'manual'`), and can be used for feature detection.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/popover) |
| readonly `prefix` | `string | null` | The **`Element.prefix`** read-only property returns the namespace prefix of the specified element, or `null` if no prefix is specified.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/prefix) |
| readonly `previousElementSibling` | `Element | null` | Returns the first preceding sibling that is an element, and null otherwise.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/previousElementSibling) |
| readonly `previousSibling` | `ChildNode | null` | The read-only **`previousSibling`** property of the Node interface returns the node immediately preceding the specified one in its parent's or `null` if the specified node is the first in that list.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/previousSibling) |
| readonly `PROCESSING_INSTRUCTION_NODE` | `7` | node is a ProcessingInstruction node. |
| `role` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/role) |
| readonly `scrollHeight` | `number` | The **`scrollHeight`** read-only property of the Element interface is a measurement of the height of an element's content, including content not visible on the screen due to overflow.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollHeight) |
| `scrollLeft` | `number` | The **`scrollLeft`** property of the Element interface gets or sets the number of pixels by which an element's content is scrolled from its left edge.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollLeft) |
| `scrollTop` | `number` | The **`scrollTop`** property of the Element interface gets or sets the number of pixels by which an element's content is scrolled from its top edge.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollTop) |
| readonly `scrollWidth` | `number` | The **`scrollWidth`** read-only property of the Element interface is a measurement of the width of an element's content, including content not visible on the screen due to overflow.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollWidth) |
| readonly `shadowRoot` | `ShadowRoot | null` | The `Element.shadowRoot` read-only property represents the shadow root hosted by the element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/shadowRoot) |
| `slot` | `string` | The **`slot`** property of the Element interface returns the name of the shadow DOM slot the element is inserted in.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/slot) |
| `spellcheck` | `boolean` | The **`spellcheck`** property of the HTMLElement interface represents a boolean value that controls the spell-checking hint.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/spellcheck) |
| `tabIndex` | `number` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/tabIndex) |
| readonly `tagName` | `string` | The **`tagName`** read-only property of the Element interface returns the tag name of the element on which it's called.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/tagName) |
| readonly `TEXT_NODE` | `3` | node is a Text node. |
| `title` | `string` | The **`HTMLElement.title`** property represents the title of the element: the text usually displayed in a 'tooltip' popup when the mouse is over the node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/title) |
| `translate` | `boolean` | The **`translate`** property of the HTMLElement interface indicates whether an element's attribute values and the values of its Text node children are to be translated when the page is localized, or whether to leave them unchanged.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/translate) |
| `writingSuggestions` | `string` | The **`writingSuggestions`** property of the HTMLElement interface is a string indicating if browser-provided writing suggestions should be enabled under the scope of the element or not.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/writingSuggestions) |
| `observedAttributes` | `string[]` | — |
| `classList` | `void` | — |
| `part` | `void` | — |
| `style` | `void` | — |
| `textContent` | `void` | — |
| `addEventListener` | `void` | — |
| `after` | `void` | — |
| `animate` | `Animation` | — |
| `append` | `void` | — |
| `appendChild` | `T` | — |
| `attachInternals` | `ElementInternals` | — |
| `attachShadow` | `ShadowRoot` | — |
| `attributeChangedCallback` | `void` | — |
| `before` | `void` | — |
| `blur` | `void` | — |
| `checkVisibility` | `boolean` | — |
| `click` | `void` | — |
| `cloneNode` | `Node` | — |
| `closest` | `HTMLElementTagNameMap[K] | null` | — |
| `compareDocumentPosition` | `number` | — |
| `computedStyleMap` | `StylePropertyMapReadOnly` | — |
| `connectedCallback` | `void` | — |
| `contains` | `boolean` | — |
| `disconnectedCallback` | `void` | — |
| `dispatchEvent` | `boolean` | — |
| `focus` | `void` | — |
| `getAnimations` | `Animation[]` | — |
| `getAttribute` | `string | null` | — |
| `getAttributeNames` | `string[]` | — |
| `getAttributeNode` | `Attr | null` | — |
| `getAttributeNodeNS` | `Attr | null` | — |
| `getAttributeNS` | `string | null` | — |
| `getBoundingClientRect` | `DOMRect` | — |
| `getClientRects` | `DOMRectList` | — |
| `getElementsByClassName` | `HTMLCollectionOf<Element>` | — |
| `getElementsByTagName` | `HTMLCollectionOf<HTMLElementTagNameMap[K]>` | — |
| `getElementsByTagNameNS` | `HTMLCollectionOf<HTMLElement>` | — |
| `getHTML` | `string` | — |
| `getRootNode` | `Node` | — |
| `hasAttribute` | `boolean` | — |
| `hasAttributeNS` | `boolean` | — |
| `hasAttributes` | `boolean` | — |
| `hasChildNodes` | `boolean` | — |
| `hasPointerCapture` | `boolean` | — |
| `hidePopover` | `void` | — |
| `insertAdjacentElement` | `Element | null` | — |
| `insertAdjacentHTML` | `void` | — |
| `insertAdjacentText` | `void` | — |
| `insertBefore` | `T` | — |
| `isDefaultNamespace` | `boolean` | — |
| `isEqualNode` | `boolean` | — |
| `isSameNode` | `boolean` | — |
| `lookupNamespaceURI` | `string | null` | — |
| `lookupPrefix` | `string | null` | — |
| `matches` | `boolean` | — |
| `normalize` | `void` | — |
| `prepend` | `void` | — |
| `querySelector` | `HTMLElementTagNameMap[K] | null` | — |
| `querySelectorAll` | `NodeListOf<HTMLElementTagNameMap[K]>` | — |
| `releasePointerCapture` | `void` | — |
| `remove` | `void` | — |
| `removeAttribute` | `void` | — |
| `removeAttributeNode` | `Attr` | — |
| `removeAttributeNS` | `void` | — |
| `removeChild` | `T` | — |
| `removeEventListener` | `void` | — |
| `replaceChild` | `T` | — |
| `replaceChildren` | `void` | — |
| `replaceWith` | `void` | — |
| `requestFullscreen` | `Promise<void>` | — |
| `requestPointerLock` | `Promise<void>` | — |
| `scroll` | `void` | — |
| `scrollBy` | `void` | — |
| `scrollIntoView` | `void` | — |
| `scrollTo` | `void` | — |
| `setAttribute` | `void` | — |
| `setAttributeNode` | `Attr | null` | — |
| `setAttributeNodeNS` | `Attr | null` | — |
| `setAttributeNS` | `void` | — |
| `setHTMLUnsafe` | `void` | — |
| `setPointerCapture` | `void` | — |
| `showPopover` | `void` | — |
| `toggleAttribute` | `boolean` | — |
| `togglePopover` | `boolean` | — |
| `webkitMatchesSelector` | `boolean` | — |
| `define` | `void` | — |

---


### `class ThemeKitScope`

**Extends** `HTMLElement`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `constructor` | `ThemeKitScope` | — |
| `accessKey` | `string` | The **`HTMLElement.accessKey`** property sets the keystroke which a user can press to jump to a given element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/accessKey) |
| readonly `accessKeyLabel` | `string` | The **`HTMLElement.accessKeyLabel`** read-only property returns a string containing the element's browser-assigned access key (if any); otherwise it returns an empty string.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/accessKeyLabel) |
| `ariaActiveDescendantElement` | `Element | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaActiveDescendantElement) |
| `ariaAtomic` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaAtomic) |
| `ariaAutoComplete` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaAutoComplete) |
| `ariaBrailleLabel` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaBrailleLabel) |
| `ariaBrailleRoleDescription` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaBrailleRoleDescription) |
| `ariaBusy` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaBusy) |
| `ariaChecked` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaChecked) |
| `ariaColCount` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaColCount) |
| `ariaColIndex` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaColIndex) |
| `ariaColIndexText` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaColIndexText) |
| `ariaColSpan` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaColSpan) |
| `ariaControlsElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaControlsElements) |
| `ariaCurrent` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaCurrent) |
| `ariaDescribedByElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaDescribedByElements) |
| `ariaDescription` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaDescription) |
| `ariaDetailsElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaDetailsElements) |
| `ariaDisabled` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaDisabled) |
| `ariaErrorMessageElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaErrorMessageElements) |
| `ariaExpanded` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaExpanded) |
| `ariaFlowToElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaFlowToElements) |
| `ariaHasPopup` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaHasPopup) |
| `ariaHidden` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaHidden) |
| `ariaInvalid` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaInvalid) |
| `ariaKeyShortcuts` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaKeyShortcuts) |
| `ariaLabel` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaLabel) |
| `ariaLabelledByElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaLabelledByElements) |
| `ariaLevel` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaLevel) |
| `ariaLive` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaLive) |
| `ariaModal` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaModal) |
| `ariaMultiLine` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaMultiLine) |
| `ariaMultiSelectable` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaMultiSelectable) |
| `ariaOrientation` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaOrientation) |
| `ariaOwnsElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaOwnsElements) |
| `ariaPlaceholder` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaPlaceholder) |
| `ariaPosInSet` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaPosInSet) |
| `ariaPressed` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaPressed) |
| `ariaReadOnly` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaReadOnly) |
| `ariaRelevant` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRelevant) |
| `ariaRequired` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRequired) |
| `ariaRoleDescription` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRoleDescription) |
| `ariaRowCount` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRowCount) |
| `ariaRowIndex` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRowIndex) |
| `ariaRowIndexText` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRowIndexText) |
| `ariaRowSpan` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRowSpan) |
| `ariaSelected` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaSelected) |
| `ariaSetSize` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaSetSize) |
| `ariaSort` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaSort) |
| `ariaValueMax` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaValueMax) |
| `ariaValueMin` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaValueMin) |
| `ariaValueNow` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaValueNow) |
| `ariaValueText` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaValueText) |
| readonly `assignedSlot` | `HTMLSlotElement | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/assignedSlot) |
| readonly `ATTRIBUTE_NODE` | `2` | — |
| readonly `attributes` | `NamedNodeMap` | The **`Element.attributes`** property returns a live collection of all attribute nodes registered to the specified node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/attributes) |
| readonly `attributeStyleMap` | `StylePropertyMap` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/attributeStyleMap) |
| `autocapitalize` | `string` | The **`autocapitalize`** property of the HTMLElement interface represents the element's capitalization behavior for user input.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/autocapitalize) |
| `autocorrect` | `boolean` | The **`autocorrect`** property of the HTMLElement interface controls whether or not autocorrection of editable text is enabled for spelling and/or punctuation errors.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/autocorrect) |
| `autofocus` | `boolean` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/autofocus) |
| readonly `baseURI` | `string` | The read-only **`baseURI`** property of the Node interface returns the absolute base URL of the document containing the node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/baseURI) |
| readonly `CDATA_SECTION_NODE` | `4` | node is a CDATASection node. |
| readonly `childElementCount` | `number` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/childElementCount) |
| readonly `childNodes` | `NodeListOf<ChildNode>` | The read-only **`childNodes`** property of the Node interface returns a live the first child node is assigned index `0`.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/childNodes) |
| readonly `children` | `HTMLCollection` | Returns the child elements.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/children) |
| `className` | `string` | The **`className`** property of the of the specified element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/className) |
| readonly `clientHeight` | `number` | The **`clientHeight`** read-only property of the Element interface is zero for elements with no CSS or inline layout boxes; otherwise, it's the inner height of an element in pixels.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/clientHeight) |
| readonly `clientLeft` | `number` | The **`clientLeft`** read-only property of the Element interface returns the width of the left border of an element in pixels.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/clientLeft) |
| readonly `clientTop` | `number` | The **`clientTop`** read-only property of the Element interface returns the width of the top border of an element in pixels.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/clientTop) |
| readonly `clientWidth` | `number` | The **`clientWidth`** read-only property of the Element interface is zero for inline elements and elements with no CSS; otherwise, it's the inner width of an element in pixels.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/clientWidth) |
| readonly `COMMENT_NODE` | `8` | node is a Comment node. |
| `contentEditable` | `string` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/contentEditable) |
| readonly `currentCSSZoom` | `number` | The **`currentCSSZoom`** read-only property of the Element interface provides the 'effective' CSS `zoom` of an element, taking into account the zoom applied to the element and all its parent elements.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/currentCSSZoom) |
| readonly `dataset` | `DOMStringMap` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dataset) |
| `dir` | `string` | The **`HTMLElement.dir`** property indicates the text writing directionality of the content of the current element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dir) |
| readonly `DOCUMENT_FRAGMENT_NODE` | `11` | node is a DocumentFragment node. |
| readonly `DOCUMENT_NODE` | `9` | node is a document. |
| readonly `DOCUMENT_POSITION_CONTAINED_BY` | `16` | Set when other is a descendant of node. |
| readonly `DOCUMENT_POSITION_CONTAINS` | `8` | Set when other is an ancestor of node. |
| readonly `DOCUMENT_POSITION_DISCONNECTED` | `1` | Set when node and other are not in the same tree. |
| readonly `DOCUMENT_POSITION_FOLLOWING` | `4` | Set when other is following node. |
| readonly `DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC` | `32` | — |
| readonly `DOCUMENT_POSITION_PRECEDING` | `2` | Set when other is preceding node. |
| readonly `DOCUMENT_TYPE_NODE` | `10` | node is a doctype. |
| `draggable` | `boolean` | The **`draggable`** property of the HTMLElement interface gets and sets a Boolean primitive indicating if the element is draggable.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/draggable) |
| readonly `ELEMENT_NODE` | `1` | node is an element. |
| `enterKeyHint` | `string` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/enterKeyHint) |
| readonly `ENTITY_NODE` | `6` | — |
| readonly `ENTITY_REFERENCE_NODE` | `5` | — |
| readonly `firstChild` | `ChildNode | null` | The read-only **`firstChild`** property of the Node interface returns the node's first child in the tree, or `null` if the node has no children.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/firstChild) |
| readonly `firstElementChild` | `Element | null` | Returns the first child that is an element, and null otherwise.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/firstElementChild) |
| `hidden` | `boolean` | The HTMLElement property **`hidden`** reflects the value of the element's `hidden` attribute.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/hidden) |
| `id` | `string` | The **`id`** property of the Element interface represents the element's identifier, reflecting the **`id`** global attribute.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/id) |
| `inert` | `boolean` | The HTMLElement property **`inert`** reflects the value of the element's `inert` attribute.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/inert) |
| `innerHTML` | `string` | The **`innerHTML`** property of the Element interface gets or sets the HTML or XML markup contained within the element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/innerHTML) |
| `innerText` | `string` | The **`innerText`** property of the HTMLElement interface represents the rendered text content of a node and its descendants.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/innerText) |
| `inputMode` | `string` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/inputMode) |
| readonly `isConnected` | `boolean` | The read-only **`isConnected`** property of the Node interface returns a boolean indicating whether the node is connected (directly or indirectly) to a Document object.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/isConnected) |
| readonly `isContentEditable` | `boolean` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/isContentEditable) |
| `lang` | `string` | The **`lang`** property of the HTMLElement interface indicates the base language of an element's attribute values and text content, in the form of a MISSING: RFC(5646, 'BCP 47 language identifier tag')].

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/lang) |
| readonly `lastChild` | `ChildNode | null` | The read-only **`lastChild`** property of the Node interface returns the last child of the node, or `null` if there are no child nodes.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/lastChild) |
| readonly `lastElementChild` | `Element | null` | Returns the last child that is an element, and null otherwise.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/lastElementChild) |
| readonly `localName` | `string` | The **`Element.localName`** read-only property returns the local part of the qualified name of an element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/localName) |
| readonly `namespaceURI` | `string | null` | The **`Element.namespaceURI`** read-only property returns the namespace URI of the element, or `null` if the element is not in a namespace.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/namespaceURI) |
| readonly `nextElementSibling` | `Element | null` | Returns the first following sibling that is an element, and null otherwise.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/nextElementSibling) |
| readonly `nextSibling` | `ChildNode | null` | The read-only **`nextSibling`** property of the Node interface returns the node immediately following the specified one in their parent's Node.childNodes, or returns `null` if the specified node is the last child in the parent element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nextSibling) |
| readonly `nodeName` | `string` | The read-only **`nodeName`** property of Node returns the name of the current node as a string.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nodeName) |
| readonly `nodeType` | `number` | The read-only **`nodeType`** property of a Node interface is an integer that identifies what the node is.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nodeType) |
| `nodeValue` | `string | null` | The **`nodeValue`** property of the Node interface returns or sets the value of the current node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nodeValue) |
| `nonce` (optional) | `string` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/nonce) |
| readonly `NOTATION_NODE` | `12` | — |
| readonly `offsetHeight` | `number` | The **`offsetHeight`** read-only property of the HTMLElement interface returns the height of an element, including vertical padding and borders, as an integer.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetHeight) |
| readonly `offsetLeft` | `number` | The **`offsetLeft`** read-only property of the HTMLElement interface returns the number of pixels that the _upper left corner_ of the current element is offset to the left within the HTMLElement.offsetParent node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetLeft) |
| readonly `offsetParent` | `Element | null` | The **`HTMLElement.offsetParent`** read-only property returns a reference to the element which is the closest (nearest in the containment hierarchy) positioned ancestor element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetParent) |
| readonly `offsetTop` | `number` | The **`offsetTop`** read-only property of the HTMLElement interface returns the distance from the outer border of the current element (including its margin) to the top padding edge of the HTMLelement.offsetParent, the _closest positioned_ ancestor element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetTop) |
| readonly `offsetWidth` | `number` | The **`offsetWidth`** read-only property of the HTMLElement interface returns the layout width of an element as an integer.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetWidth) |
| `onabort` | `__type(this: GlobalEventHandlers, ev: UIEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/abort_event) |
| `onanimationcancel` | `__type(this: GlobalEventHandlers, ev: AnimationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/animationcancel_event) |
| `onanimationend` | `__type(this: GlobalEventHandlers, ev: AnimationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/animationend_event) |
| `onanimationiteration` | `__type(this: GlobalEventHandlers, ev: AnimationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/animationiteration_event) |
| `onanimationstart` | `__type(this: GlobalEventHandlers, ev: AnimationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/animationstart_event) |
| `onauxclick` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/auxclick_event) |
| `onbeforeinput` | `__type(this: GlobalEventHandlers, ev: InputEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/beforeinput_event) |
| `onbeforematch` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/beforematch_event) |
| `onbeforetoggle` | `__type(this: GlobalEventHandlers, ev: ToggleEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/beforetoggle_event) |
| `onblur` | `__type(this: GlobalEventHandlers, ev: FocusEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/blur_event) |
| `oncancel` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLDialogElement/cancel_event) |
| `oncanplay` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/canplay_event) |
| `oncanplaythrough` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/canplaythrough_event) |
| `onchange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/change_event) |
| `onclick` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/click_event) |
| `onclose` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLDialogElement/close_event) |
| `oncontextlost` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/contextlost_event) |
| `oncontextmenu` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/contextmenu_event) |
| `oncontextrestored` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/contextrestored_event) |
| `oncopy` | `__type(this: GlobalEventHandlers, ev: ClipboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/copy_event) |
| `oncuechange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLTrackElement/cuechange_event) |
| `oncut` | `__type(this: GlobalEventHandlers, ev: ClipboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/cut_event) |
| `ondblclick` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/dblclick_event) |
| `ondrag` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/drag_event) |
| `ondragend` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragend_event) |
| `ondragenter` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragenter_event) |
| `ondragleave` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragleave_event) |
| `ondragover` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragover_event) |
| `ondragstart` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragstart_event) |
| `ondrop` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/drop_event) |
| `ondurationchange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/durationchange_event) |
| `onemptied` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/emptied_event) |
| `onended` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/ended_event) |
| `onerror` | `OnErrorEventHandler` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/error_event) |
| `onfocus` | `__type(this: GlobalEventHandlers, ev: FocusEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/focus_event) |
| `onformdata` | `__type(this: GlobalEventHandlers, ev: FormDataEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLFormElement/formdata_event) |
| `onfullscreenchange` | `__type(this: Element, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/fullscreenchange_event) |
| `onfullscreenerror` | `__type(this: Element, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/fullscreenerror_event) |
| `ongotpointercapture` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/gotpointercapture_event) |
| `oninput` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/input_event) |
| `oninvalid` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLInputElement/invalid_event) |
| `onkeydown` | `__type(this: GlobalEventHandlers, ev: KeyboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/keydown_event) |
| `onkeypress` | `__type(this: GlobalEventHandlers, ev: KeyboardEvent): any | null` | — |
| `onkeyup` | `__type(this: GlobalEventHandlers, ev: KeyboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/keyup_event) |
| `onload` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/load_event) |
| `onloadeddata` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/loadeddata_event) |
| `onloadedmetadata` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/loadedmetadata_event) |
| `onloadstart` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/loadstart_event) |
| `onlostpointercapture` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/lostpointercapture_event) |
| `onmousedown` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mousedown_event) |
| `onmouseenter` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseenter_event) |
| `onmouseleave` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseleave_event) |
| `onmousemove` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mousemove_event) |
| `onmouseout` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseout_event) |
| `onmouseover` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseover_event) |
| `onmouseup` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseup_event) |
| `onpaste` | `__type(this: GlobalEventHandlers, ev: ClipboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/paste_event) |
| `onpause` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/pause_event) |
| `onplay` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/play_event) |
| `onplaying` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/playing_event) |
| `onpointercancel` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointercancel_event) |
| `onpointerdown` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event) |
| `onpointerenter` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event) |
| `onpointerleave` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event) |
| `onpointermove` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointermove_event) |
| `onpointerout` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerout_event) |
| `onpointerover` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerover_event) |
| `onpointerrawupdate` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | Available only in secure contexts.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerrawupdate_event) |
| `onpointerup` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event) |
| `onprogress` | `__type(this: GlobalEventHandlers, ev: ProgressEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/progress_event) |
| `onratechange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/ratechange_event) |
| `onreset` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLFormElement/reset_event) |
| `onresize` | `__type(this: GlobalEventHandlers, ev: UIEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLVideoElement/resize_event) |
| `onscroll` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/scroll_event) |
| `onscrollend` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/scrollend_event) |
| `onsecuritypolicyviolation` | `__type(this: GlobalEventHandlers, ev: SecurityPolicyViolationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/securitypolicyviolation_event) |
| `onseeked` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/seeked_event) |
| `onseeking` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/seeking_event) |
| `onselect` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLInputElement/select_event) |
| `onselectionchange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/selectionchange_event) |
| `onselectstart` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/selectstart_event) |
| `onslotchange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLSlotElement/slotchange_event) |
| `onstalled` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/stalled_event) |
| `onsubmit` | `__type(this: GlobalEventHandlers, ev: SubmitEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLFormElement/submit_event) |
| `onsuspend` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/suspend_event) |
| `ontimeupdate` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/timeupdate_event) |
| `ontoggle` | `__type(this: GlobalEventHandlers, ev: ToggleEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/toggle_event) |
| `ontouchcancel` (optional) | `__type(this: GlobalEventHandlers, ev: TouchEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/touchcancel_event) |
| `ontouchend` (optional) | `__type(this: GlobalEventHandlers, ev: TouchEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/touchend_event) |
| `ontouchmove` (optional) | `__type(this: GlobalEventHandlers, ev: TouchEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/touchmove_event) |
| `ontouchstart` (optional) | `__type(this: GlobalEventHandlers, ev: TouchEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/touchstart_event) |
| `ontransitioncancel` | `__type(this: GlobalEventHandlers, ev: TransitionEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/transitioncancel_event) |
| `ontransitionend` | `__type(this: GlobalEventHandlers, ev: TransitionEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/transitionend_event) |
| `ontransitionrun` | `__type(this: GlobalEventHandlers, ev: TransitionEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/transitionrun_event) |
| `ontransitionstart` | `__type(this: GlobalEventHandlers, ev: TransitionEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/transitionstart_event) |
| `onvolumechange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/volumechange_event) |
| `onwaiting` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/waiting_event) |
| `onwebkitanimationend` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | — |
| `onwebkitanimationiteration` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | — |
| `onwebkitanimationstart` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | — |
| `onwebkittransitionend` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | — |
| `onwheel` | `__type(this: GlobalEventHandlers, ev: WheelEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/wheel_event) |
| `outerHTML` | `string` | The **`outerHTML`** attribute of the Element DOM interface gets the serialized HTML fragment describing the element including its descendants.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/outerHTML) |
| `outerText` | `string` | The **`outerText`** property of the HTMLElement interface returns the same value as HTMLElement.innerText.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/outerText) |
| readonly `ownerDocument` | `Document` | The read-only **`ownerDocument`** property of the Node interface returns the top-level document object of the node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/ownerDocument) |
| readonly `parentElement` | `HTMLElement | null` | The read-only **`parentElement`** property of Node interface returns the DOM node's parent Element, or `null` if the node either has no parent, or its parent isn't a DOM Element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/parentElement) |
| readonly `parentNode` | `ParentNode | null` | The read-only **`parentNode`** property of the Node interface returns the parent of the specified node in the DOM tree.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/parentNode) |
| `popover` | `string | null` | The **`popover`** property of the HTMLElement interface gets and sets an element's popover state via JavaScript (`'auto'`, `'hint'`, or `'manual'`), and can be used for feature detection.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/popover) |
| readonly `prefix` | `string | null` | The **`Element.prefix`** read-only property returns the namespace prefix of the specified element, or `null` if no prefix is specified.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/prefix) |
| readonly `previousElementSibling` | `Element | null` | Returns the first preceding sibling that is an element, and null otherwise.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/previousElementSibling) |
| readonly `previousSibling` | `ChildNode | null` | The read-only **`previousSibling`** property of the Node interface returns the node immediately preceding the specified one in its parent's or `null` if the specified node is the first in that list.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/previousSibling) |
| readonly `PROCESSING_INSTRUCTION_NODE` | `7` | node is a ProcessingInstruction node. |
| `role` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/role) |
| readonly `scrollHeight` | `number` | The **`scrollHeight`** read-only property of the Element interface is a measurement of the height of an element's content, including content not visible on the screen due to overflow.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollHeight) |
| `scrollLeft` | `number` | The **`scrollLeft`** property of the Element interface gets or sets the number of pixels by which an element's content is scrolled from its left edge.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollLeft) |
| `scrollTop` | `number` | The **`scrollTop`** property of the Element interface gets or sets the number of pixels by which an element's content is scrolled from its top edge.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollTop) |
| readonly `scrollWidth` | `number` | The **`scrollWidth`** read-only property of the Element interface is a measurement of the width of an element's content, including content not visible on the screen due to overflow.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollWidth) |
| readonly `shadowRoot` | `ShadowRoot | null` | The `Element.shadowRoot` read-only property represents the shadow root hosted by the element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/shadowRoot) |
| `slot` | `string` | The **`slot`** property of the Element interface returns the name of the shadow DOM slot the element is inserted in.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/slot) |
| `spellcheck` | `boolean` | The **`spellcheck`** property of the HTMLElement interface represents a boolean value that controls the spell-checking hint.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/spellcheck) |
| `tabIndex` | `number` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/tabIndex) |
| readonly `tagName` | `string` | The **`tagName`** read-only property of the Element interface returns the tag name of the element on which it's called.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/tagName) |
| readonly `TEXT_NODE` | `3` | node is a Text node. |
| `title` | `string` | The **`HTMLElement.title`** property represents the title of the element: the text usually displayed in a 'tooltip' popup when the mouse is over the node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/title) |
| `translate` | `boolean` | The **`translate`** property of the HTMLElement interface indicates whether an element's attribute values and the values of its Text node children are to be translated when the page is localized, or whether to leave them unchanged.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/translate) |
| `writingSuggestions` | `string` | The **`writingSuggestions`** property of the HTMLElement interface is a string indicating if browser-provided writing suggestions should be enabled under the scope of the element or not.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/writingSuggestions) |
| `observedAttributes` | `string[]` | — |
| `classList` | `void` | — |
| `part` | `void` | — |
| `style` | `void` | — |
| `textContent` | `void` | — |
| `addEventListener` | `void` | — |
| `after` | `void` | — |
| `animate` | `Animation` | — |
| `append` | `void` | — |
| `appendChild` | `T` | — |
| `attachInternals` | `ElementInternals` | — |
| `attachShadow` | `ShadowRoot` | — |
| `attributeChangedCallback` | `void` | — |
| `before` | `void` | — |
| `blur` | `void` | — |
| `checkVisibility` | `boolean` | — |
| `click` | `void` | — |
| `cloneNode` | `Node` | — |
| `closest` | `HTMLElementTagNameMap[K] | null` | — |
| `compareDocumentPosition` | `number` | — |
| `computedStyleMap` | `StylePropertyMapReadOnly` | — |
| `connectedCallback` | `void` | — |
| `contains` | `boolean` | — |
| `disconnectedCallback` | `void` | — |
| `dispatchEvent` | `boolean` | — |
| `focus` | `void` | — |
| `getAnimations` | `Animation[]` | — |
| `getAttribute` | `string | null` | — |
| `getAttributeNames` | `string[]` | — |
| `getAttributeNode` | `Attr | null` | — |
| `getAttributeNodeNS` | `Attr | null` | — |
| `getAttributeNS` | `string | null` | — |
| `getBoundingClientRect` | `DOMRect` | — |
| `getClientRects` | `DOMRectList` | — |
| `getElementsByClassName` | `HTMLCollectionOf<Element>` | — |
| `getElementsByTagName` | `HTMLCollectionOf<HTMLElementTagNameMap[K]>` | — |
| `getElementsByTagNameNS` | `HTMLCollectionOf<HTMLElement>` | — |
| `getHTML` | `string` | — |
| `getRootNode` | `Node` | — |
| `hasAttribute` | `boolean` | — |
| `hasAttributeNS` | `boolean` | — |
| `hasAttributes` | `boolean` | — |
| `hasChildNodes` | `boolean` | — |
| `hasPointerCapture` | `boolean` | — |
| `hidePopover` | `void` | — |
| `insertAdjacentElement` | `Element | null` | — |
| `insertAdjacentHTML` | `void` | — |
| `insertAdjacentText` | `void` | — |
| `insertBefore` | `T` | — |
| `isDefaultNamespace` | `boolean` | — |
| `isEqualNode` | `boolean` | — |
| `isSameNode` | `boolean` | — |
| `lookupNamespaceURI` | `string | null` | — |
| `lookupPrefix` | `string | null` | — |
| `matches` | `boolean` | — |
| `normalize` | `void` | — |
| `prepend` | `void` | — |
| `querySelector` | `HTMLElementTagNameMap[K] | null` | — |
| `querySelectorAll` | `NodeListOf<HTMLElementTagNameMap[K]>` | — |
| `releasePointerCapture` | `void` | — |
| `remove` | `void` | — |
| `removeAttribute` | `void` | — |
| `removeAttributeNode` | `Attr` | — |
| `removeAttributeNS` | `void` | — |
| `removeChild` | `T` | — |
| `removeEventListener` | `void` | — |
| `replaceChild` | `T` | — |
| `replaceChildren` | `void` | — |
| `replaceWith` | `void` | — |
| `requestFullscreen` | `Promise<void>` | — |
| `requestPointerLock` | `Promise<void>` | — |
| `scroll` | `void` | — |
| `scrollBy` | `void` | — |
| `scrollIntoView` | `void` | — |
| `scrollTo` | `void` | — |
| `setAttribute` | `void` | — |
| `setAttributeNode` | `Attr | null` | — |
| `setAttributeNodeNS` | `Attr | null` | — |
| `setAttributeNS` | `void` | — |
| `setHTMLUnsafe` | `void` | — |
| `setPointerCapture` | `void` | — |
| `showPopover` | `void` | — |
| `toggleAttribute` | `boolean` | — |
| `togglePopover` | `boolean` | — |
| `webkitMatchesSelector` | `boolean` | — |
| `define` | `void` | — |

---


### `class ThemeKitScrollbar`

**Extends** `HTMLElement`
Phase 2 — ThemeKitScrollbar (Web Component): overlay only.

Creates the custom scrollbar overlay. Does NOT hide the native
scrollbar — that's the bootstrap script's job (Phase 1, tk-scrollbar).

| Member | Type | Description |
| ------ | ---- | ----------- |
| `constructor` | `ThemeKitScrollbar` | — |
| `accessKey` | `string` | The **`HTMLElement.accessKey`** property sets the keystroke which a user can press to jump to a given element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/accessKey) |
| readonly `accessKeyLabel` | `string` | The **`HTMLElement.accessKeyLabel`** read-only property returns a string containing the element's browser-assigned access key (if any); otherwise it returns an empty string.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/accessKeyLabel) |
| `ariaActiveDescendantElement` | `Element | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaActiveDescendantElement) |
| `ariaAtomic` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaAtomic) |
| `ariaAutoComplete` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaAutoComplete) |
| `ariaBrailleLabel` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaBrailleLabel) |
| `ariaBrailleRoleDescription` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaBrailleRoleDescription) |
| `ariaBusy` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaBusy) |
| `ariaChecked` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaChecked) |
| `ariaColCount` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaColCount) |
| `ariaColIndex` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaColIndex) |
| `ariaColIndexText` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaColIndexText) |
| `ariaColSpan` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaColSpan) |
| `ariaControlsElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaControlsElements) |
| `ariaCurrent` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaCurrent) |
| `ariaDescribedByElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaDescribedByElements) |
| `ariaDescription` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaDescription) |
| `ariaDetailsElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaDetailsElements) |
| `ariaDisabled` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaDisabled) |
| `ariaErrorMessageElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaErrorMessageElements) |
| `ariaExpanded` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaExpanded) |
| `ariaFlowToElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaFlowToElements) |
| `ariaHasPopup` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaHasPopup) |
| `ariaHidden` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaHidden) |
| `ariaInvalid` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaInvalid) |
| `ariaKeyShortcuts` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaKeyShortcuts) |
| `ariaLabel` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaLabel) |
| `ariaLabelledByElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaLabelledByElements) |
| `ariaLevel` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaLevel) |
| `ariaLive` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaLive) |
| `ariaModal` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaModal) |
| `ariaMultiLine` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaMultiLine) |
| `ariaMultiSelectable` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaMultiSelectable) |
| `ariaOrientation` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaOrientation) |
| `ariaOwnsElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaOwnsElements) |
| `ariaPlaceholder` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaPlaceholder) |
| `ariaPosInSet` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaPosInSet) |
| `ariaPressed` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaPressed) |
| `ariaReadOnly` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaReadOnly) |
| `ariaRelevant` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRelevant) |
| `ariaRequired` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRequired) |
| `ariaRoleDescription` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRoleDescription) |
| `ariaRowCount` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRowCount) |
| `ariaRowIndex` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRowIndex) |
| `ariaRowIndexText` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRowIndexText) |
| `ariaRowSpan` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRowSpan) |
| `ariaSelected` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaSelected) |
| `ariaSetSize` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaSetSize) |
| `ariaSort` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaSort) |
| `ariaValueMax` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaValueMax) |
| `ariaValueMin` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaValueMin) |
| `ariaValueNow` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaValueNow) |
| `ariaValueText` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaValueText) |
| readonly `assignedSlot` | `HTMLSlotElement | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/assignedSlot) |
| readonly `ATTRIBUTE_NODE` | `2` | — |
| readonly `attributes` | `NamedNodeMap` | The **`Element.attributes`** property returns a live collection of all attribute nodes registered to the specified node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/attributes) |
| readonly `attributeStyleMap` | `StylePropertyMap` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/attributeStyleMap) |
| `autocapitalize` | `string` | The **`autocapitalize`** property of the HTMLElement interface represents the element's capitalization behavior for user input.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/autocapitalize) |
| `autocorrect` | `boolean` | The **`autocorrect`** property of the HTMLElement interface controls whether or not autocorrection of editable text is enabled for spelling and/or punctuation errors.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/autocorrect) |
| `autofocus` | `boolean` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/autofocus) |
| readonly `baseURI` | `string` | The read-only **`baseURI`** property of the Node interface returns the absolute base URL of the document containing the node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/baseURI) |
| readonly `CDATA_SECTION_NODE` | `4` | node is a CDATASection node. |
| readonly `childElementCount` | `number` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/childElementCount) |
| readonly `childNodes` | `NodeListOf<ChildNode>` | The read-only **`childNodes`** property of the Node interface returns a live the first child node is assigned index `0`.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/childNodes) |
| readonly `children` | `HTMLCollection` | Returns the child elements.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/children) |
| `className` | `string` | The **`className`** property of the of the specified element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/className) |
| readonly `clientHeight` | `number` | The **`clientHeight`** read-only property of the Element interface is zero for elements with no CSS or inline layout boxes; otherwise, it's the inner height of an element in pixels.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/clientHeight) |
| readonly `clientLeft` | `number` | The **`clientLeft`** read-only property of the Element interface returns the width of the left border of an element in pixels.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/clientLeft) |
| readonly `clientTop` | `number` | The **`clientTop`** read-only property of the Element interface returns the width of the top border of an element in pixels.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/clientTop) |
| readonly `clientWidth` | `number` | The **`clientWidth`** read-only property of the Element interface is zero for inline elements and elements with no CSS; otherwise, it's the inner width of an element in pixels.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/clientWidth) |
| readonly `COMMENT_NODE` | `8` | node is a Comment node. |
| `contentEditable` | `string` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/contentEditable) |
| readonly `currentCSSZoom` | `number` | The **`currentCSSZoom`** read-only property of the Element interface provides the 'effective' CSS `zoom` of an element, taking into account the zoom applied to the element and all its parent elements.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/currentCSSZoom) |
| readonly `dataset` | `DOMStringMap` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dataset) |
| `dir` | `string` | The **`HTMLElement.dir`** property indicates the text writing directionality of the content of the current element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dir) |
| readonly `DOCUMENT_FRAGMENT_NODE` | `11` | node is a DocumentFragment node. |
| readonly `DOCUMENT_NODE` | `9` | node is a document. |
| readonly `DOCUMENT_POSITION_CONTAINED_BY` | `16` | Set when other is a descendant of node. |
| readonly `DOCUMENT_POSITION_CONTAINS` | `8` | Set when other is an ancestor of node. |
| readonly `DOCUMENT_POSITION_DISCONNECTED` | `1` | Set when node and other are not in the same tree. |
| readonly `DOCUMENT_POSITION_FOLLOWING` | `4` | Set when other is following node. |
| readonly `DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC` | `32` | — |
| readonly `DOCUMENT_POSITION_PRECEDING` | `2` | Set when other is preceding node. |
| readonly `DOCUMENT_TYPE_NODE` | `10` | node is a doctype. |
| `draggable` | `boolean` | The **`draggable`** property of the HTMLElement interface gets and sets a Boolean primitive indicating if the element is draggable.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/draggable) |
| readonly `ELEMENT_NODE` | `1` | node is an element. |
| `enterKeyHint` | `string` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/enterKeyHint) |
| readonly `ENTITY_NODE` | `6` | — |
| readonly `ENTITY_REFERENCE_NODE` | `5` | — |
| readonly `firstChild` | `ChildNode | null` | The read-only **`firstChild`** property of the Node interface returns the node's first child in the tree, or `null` if the node has no children.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/firstChild) |
| readonly `firstElementChild` | `Element | null` | Returns the first child that is an element, and null otherwise.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/firstElementChild) |
| `hidden` | `boolean` | The HTMLElement property **`hidden`** reflects the value of the element's `hidden` attribute.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/hidden) |
| `id` | `string` | The **`id`** property of the Element interface represents the element's identifier, reflecting the **`id`** global attribute.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/id) |
| `inert` | `boolean` | The HTMLElement property **`inert`** reflects the value of the element's `inert` attribute.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/inert) |
| `innerHTML` | `string` | The **`innerHTML`** property of the Element interface gets or sets the HTML or XML markup contained within the element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/innerHTML) |
| `innerText` | `string` | The **`innerText`** property of the HTMLElement interface represents the rendered text content of a node and its descendants.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/innerText) |
| `inputMode` | `string` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/inputMode) |
| readonly `isConnected` | `boolean` | The read-only **`isConnected`** property of the Node interface returns a boolean indicating whether the node is connected (directly or indirectly) to a Document object.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/isConnected) |
| readonly `isContentEditable` | `boolean` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/isContentEditable) |
| `lang` | `string` | The **`lang`** property of the HTMLElement interface indicates the base language of an element's attribute values and text content, in the form of a MISSING: RFC(5646, 'BCP 47 language identifier tag')].

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/lang) |
| readonly `lastChild` | `ChildNode | null` | The read-only **`lastChild`** property of the Node interface returns the last child of the node, or `null` if there are no child nodes.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/lastChild) |
| readonly `lastElementChild` | `Element | null` | Returns the last child that is an element, and null otherwise.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/lastElementChild) |
| readonly `localName` | `string` | The **`Element.localName`** read-only property returns the local part of the qualified name of an element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/localName) |
| readonly `namespaceURI` | `string | null` | The **`Element.namespaceURI`** read-only property returns the namespace URI of the element, or `null` if the element is not in a namespace.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/namespaceURI) |
| readonly `nextElementSibling` | `Element | null` | Returns the first following sibling that is an element, and null otherwise.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/nextElementSibling) |
| readonly `nextSibling` | `ChildNode | null` | The read-only **`nextSibling`** property of the Node interface returns the node immediately following the specified one in their parent's Node.childNodes, or returns `null` if the specified node is the last child in the parent element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nextSibling) |
| readonly `nodeName` | `string` | The read-only **`nodeName`** property of Node returns the name of the current node as a string.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nodeName) |
| readonly `nodeType` | `number` | The read-only **`nodeType`** property of a Node interface is an integer that identifies what the node is.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nodeType) |
| `nodeValue` | `string | null` | The **`nodeValue`** property of the Node interface returns or sets the value of the current node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nodeValue) |
| `nonce` (optional) | `string` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/nonce) |
| readonly `NOTATION_NODE` | `12` | — |
| readonly `offsetHeight` | `number` | The **`offsetHeight`** read-only property of the HTMLElement interface returns the height of an element, including vertical padding and borders, as an integer.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetHeight) |
| readonly `offsetLeft` | `number` | The **`offsetLeft`** read-only property of the HTMLElement interface returns the number of pixels that the _upper left corner_ of the current element is offset to the left within the HTMLElement.offsetParent node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetLeft) |
| readonly `offsetParent` | `Element | null` | The **`HTMLElement.offsetParent`** read-only property returns a reference to the element which is the closest (nearest in the containment hierarchy) positioned ancestor element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetParent) |
| readonly `offsetTop` | `number` | The **`offsetTop`** read-only property of the HTMLElement interface returns the distance from the outer border of the current element (including its margin) to the top padding edge of the HTMLelement.offsetParent, the _closest positioned_ ancestor element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetTop) |
| readonly `offsetWidth` | `number` | The **`offsetWidth`** read-only property of the HTMLElement interface returns the layout width of an element as an integer.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetWidth) |
| `onabort` | `__type(this: GlobalEventHandlers, ev: UIEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/abort_event) |
| `onanimationcancel` | `__type(this: GlobalEventHandlers, ev: AnimationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/animationcancel_event) |
| `onanimationend` | `__type(this: GlobalEventHandlers, ev: AnimationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/animationend_event) |
| `onanimationiteration` | `__type(this: GlobalEventHandlers, ev: AnimationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/animationiteration_event) |
| `onanimationstart` | `__type(this: GlobalEventHandlers, ev: AnimationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/animationstart_event) |
| `onauxclick` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/auxclick_event) |
| `onbeforeinput` | `__type(this: GlobalEventHandlers, ev: InputEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/beforeinput_event) |
| `onbeforematch` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/beforematch_event) |
| `onbeforetoggle` | `__type(this: GlobalEventHandlers, ev: ToggleEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/beforetoggle_event) |
| `onblur` | `__type(this: GlobalEventHandlers, ev: FocusEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/blur_event) |
| `oncancel` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLDialogElement/cancel_event) |
| `oncanplay` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/canplay_event) |
| `oncanplaythrough` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/canplaythrough_event) |
| `onchange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/change_event) |
| `onclick` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/click_event) |
| `onclose` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLDialogElement/close_event) |
| `oncontextlost` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/contextlost_event) |
| `oncontextmenu` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/contextmenu_event) |
| `oncontextrestored` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/contextrestored_event) |
| `oncopy` | `__type(this: GlobalEventHandlers, ev: ClipboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/copy_event) |
| `oncuechange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLTrackElement/cuechange_event) |
| `oncut` | `__type(this: GlobalEventHandlers, ev: ClipboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/cut_event) |
| `ondblclick` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/dblclick_event) |
| `ondrag` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/drag_event) |
| `ondragend` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragend_event) |
| `ondragenter` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragenter_event) |
| `ondragleave` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragleave_event) |
| `ondragover` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragover_event) |
| `ondragstart` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragstart_event) |
| `ondrop` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/drop_event) |
| `ondurationchange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/durationchange_event) |
| `onemptied` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/emptied_event) |
| `onended` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/ended_event) |
| `onerror` | `OnErrorEventHandler` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/error_event) |
| `onfocus` | `__type(this: GlobalEventHandlers, ev: FocusEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/focus_event) |
| `onformdata` | `__type(this: GlobalEventHandlers, ev: FormDataEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLFormElement/formdata_event) |
| `onfullscreenchange` | `__type(this: Element, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/fullscreenchange_event) |
| `onfullscreenerror` | `__type(this: Element, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/fullscreenerror_event) |
| `ongotpointercapture` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/gotpointercapture_event) |
| `oninput` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/input_event) |
| `oninvalid` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLInputElement/invalid_event) |
| `onkeydown` | `__type(this: GlobalEventHandlers, ev: KeyboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/keydown_event) |
| `onkeypress` | `__type(this: GlobalEventHandlers, ev: KeyboardEvent): any | null` | — |
| `onkeyup` | `__type(this: GlobalEventHandlers, ev: KeyboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/keyup_event) |
| `onload` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/load_event) |
| `onloadeddata` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/loadeddata_event) |
| `onloadedmetadata` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/loadedmetadata_event) |
| `onloadstart` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/loadstart_event) |
| `onlostpointercapture` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/lostpointercapture_event) |
| `onmousedown` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mousedown_event) |
| `onmouseenter` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseenter_event) |
| `onmouseleave` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseleave_event) |
| `onmousemove` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mousemove_event) |
| `onmouseout` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseout_event) |
| `onmouseover` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseover_event) |
| `onmouseup` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseup_event) |
| `onpaste` | `__type(this: GlobalEventHandlers, ev: ClipboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/paste_event) |
| `onpause` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/pause_event) |
| `onplay` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/play_event) |
| `onplaying` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/playing_event) |
| `onpointercancel` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointercancel_event) |
| `onpointerdown` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event) |
| `onpointerenter` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event) |
| `onpointerleave` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event) |
| `onpointermove` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointermove_event) |
| `onpointerout` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerout_event) |
| `onpointerover` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerover_event) |
| `onpointerrawupdate` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | Available only in secure contexts.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerrawupdate_event) |
| `onpointerup` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event) |
| `onprogress` | `__type(this: GlobalEventHandlers, ev: ProgressEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/progress_event) |
| `onratechange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/ratechange_event) |
| `onreset` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLFormElement/reset_event) |
| `onresize` | `__type(this: GlobalEventHandlers, ev: UIEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLVideoElement/resize_event) |
| `onscroll` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/scroll_event) |
| `onscrollend` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/scrollend_event) |
| `onsecuritypolicyviolation` | `__type(this: GlobalEventHandlers, ev: SecurityPolicyViolationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/securitypolicyviolation_event) |
| `onseeked` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/seeked_event) |
| `onseeking` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/seeking_event) |
| `onselect` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLInputElement/select_event) |
| `onselectionchange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/selectionchange_event) |
| `onselectstart` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/selectstart_event) |
| `onslotchange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLSlotElement/slotchange_event) |
| `onstalled` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/stalled_event) |
| `onsubmit` | `__type(this: GlobalEventHandlers, ev: SubmitEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLFormElement/submit_event) |
| `onsuspend` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/suspend_event) |
| `ontimeupdate` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/timeupdate_event) |
| `ontoggle` | `__type(this: GlobalEventHandlers, ev: ToggleEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/toggle_event) |
| `ontouchcancel` (optional) | `__type(this: GlobalEventHandlers, ev: TouchEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/touchcancel_event) |
| `ontouchend` (optional) | `__type(this: GlobalEventHandlers, ev: TouchEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/touchend_event) |
| `ontouchmove` (optional) | `__type(this: GlobalEventHandlers, ev: TouchEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/touchmove_event) |
| `ontouchstart` (optional) | `__type(this: GlobalEventHandlers, ev: TouchEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/touchstart_event) |
| `ontransitioncancel` | `__type(this: GlobalEventHandlers, ev: TransitionEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/transitioncancel_event) |
| `ontransitionend` | `__type(this: GlobalEventHandlers, ev: TransitionEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/transitionend_event) |
| `ontransitionrun` | `__type(this: GlobalEventHandlers, ev: TransitionEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/transitionrun_event) |
| `ontransitionstart` | `__type(this: GlobalEventHandlers, ev: TransitionEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/transitionstart_event) |
| `onvolumechange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/volumechange_event) |
| `onwaiting` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/waiting_event) |
| `onwebkitanimationend` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | — |
| `onwebkitanimationiteration` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | — |
| `onwebkitanimationstart` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | — |
| `onwebkittransitionend` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | — |
| `onwheel` | `__type(this: GlobalEventHandlers, ev: WheelEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/wheel_event) |
| `outerHTML` | `string` | The **`outerHTML`** attribute of the Element DOM interface gets the serialized HTML fragment describing the element including its descendants.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/outerHTML) |
| `outerText` | `string` | The **`outerText`** property of the HTMLElement interface returns the same value as HTMLElement.innerText.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/outerText) |
| readonly `ownerDocument` | `Document` | The read-only **`ownerDocument`** property of the Node interface returns the top-level document object of the node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/ownerDocument) |
| readonly `parentElement` | `HTMLElement | null` | The read-only **`parentElement`** property of Node interface returns the DOM node's parent Element, or `null` if the node either has no parent, or its parent isn't a DOM Element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/parentElement) |
| readonly `parentNode` | `ParentNode | null` | The read-only **`parentNode`** property of the Node interface returns the parent of the specified node in the DOM tree.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/parentNode) |
| `popover` | `string | null` | The **`popover`** property of the HTMLElement interface gets and sets an element's popover state via JavaScript (`'auto'`, `'hint'`, or `'manual'`), and can be used for feature detection.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/popover) |
| readonly `prefix` | `string | null` | The **`Element.prefix`** read-only property returns the namespace prefix of the specified element, or `null` if no prefix is specified.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/prefix) |
| readonly `previousElementSibling` | `Element | null` | Returns the first preceding sibling that is an element, and null otherwise.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/previousElementSibling) |
| readonly `previousSibling` | `ChildNode | null` | The read-only **`previousSibling`** property of the Node interface returns the node immediately preceding the specified one in its parent's or `null` if the specified node is the first in that list.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/previousSibling) |
| readonly `PROCESSING_INSTRUCTION_NODE` | `7` | node is a ProcessingInstruction node. |
| `role` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/role) |
| readonly `scrollHeight` | `number` | The **`scrollHeight`** read-only property of the Element interface is a measurement of the height of an element's content, including content not visible on the screen due to overflow.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollHeight) |
| `scrollLeft` | `number` | The **`scrollLeft`** property of the Element interface gets or sets the number of pixels by which an element's content is scrolled from its left edge.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollLeft) |
| `scrollTop` | `number` | The **`scrollTop`** property of the Element interface gets or sets the number of pixels by which an element's content is scrolled from its top edge.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollTop) |
| readonly `scrollWidth` | `number` | The **`scrollWidth`** read-only property of the Element interface is a measurement of the width of an element's content, including content not visible on the screen due to overflow.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollWidth) |
| readonly `shadowRoot` | `ShadowRoot | null` | The `Element.shadowRoot` read-only property represents the shadow root hosted by the element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/shadowRoot) |
| `slot` | `string` | The **`slot`** property of the Element interface returns the name of the shadow DOM slot the element is inserted in.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/slot) |
| `spellcheck` | `boolean` | The **`spellcheck`** property of the HTMLElement interface represents a boolean value that controls the spell-checking hint.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/spellcheck) |
| `tabIndex` | `number` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/tabIndex) |
| readonly `tagName` | `string` | The **`tagName`** read-only property of the Element interface returns the tag name of the element on which it's called.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/tagName) |
| readonly `TEXT_NODE` | `3` | node is a Text node. |
| `title` | `string` | The **`HTMLElement.title`** property represents the title of the element: the text usually displayed in a 'tooltip' popup when the mouse is over the node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/title) |
| `translate` | `boolean` | The **`translate`** property of the HTMLElement interface indicates whether an element's attribute values and the values of its Text node children are to be translated when the page is localized, or whether to leave them unchanged.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/translate) |
| `writingSuggestions` | `string` | The **`writingSuggestions`** property of the HTMLElement interface is a string indicating if browser-provided writing suggestions should be enabled under the scope of the element or not.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/writingSuggestions) |
| `classList` | `void` | — |
| `part` | `void` | — |
| `style` | `void` | — |
| `textContent` | `void` | — |
| `addEventListener` | `void` | — |
| `after` | `void` | — |
| `animate` | `Animation` | — |
| `append` | `void` | — |
| `appendChild` | `T` | — |
| `attachInternals` | `ElementInternals` | — |
| `attachShadow` | `ShadowRoot` | — |
| `before` | `void` | — |
| `blur` | `void` | — |
| `checkVisibility` | `boolean` | — |
| `click` | `void` | — |
| `cloneNode` | `Node` | — |
| `closest` | `HTMLElementTagNameMap[K] | null` | — |
| `compareDocumentPosition` | `number` | — |
| `computedStyleMap` | `StylePropertyMapReadOnly` | — |
| `connectedCallback` | `void` | — |
| `contains` | `boolean` | — |
| `disconnectedCallback` | `void` | — |
| `dispatchEvent` | `boolean` | — |
| `focus` | `void` | — |
| `getAnimations` | `Animation[]` | — |
| `getAttribute` | `string | null` | — |
| `getAttributeNames` | `string[]` | — |
| `getAttributeNode` | `Attr | null` | — |
| `getAttributeNodeNS` | `Attr | null` | — |
| `getAttributeNS` | `string | null` | — |
| `getBoundingClientRect` | `DOMRect` | — |
| `getClientRects` | `DOMRectList` | — |
| `getElementsByClassName` | `HTMLCollectionOf<Element>` | — |
| `getElementsByTagName` | `HTMLCollectionOf<HTMLElementTagNameMap[K]>` | — |
| `getElementsByTagNameNS` | `HTMLCollectionOf<HTMLElement>` | — |
| `getHTML` | `string` | — |
| `getRootNode` | `Node` | — |
| `hasAttribute` | `boolean` | — |
| `hasAttributeNS` | `boolean` | — |
| `hasAttributes` | `boolean` | — |
| `hasChildNodes` | `boolean` | — |
| `hasPointerCapture` | `boolean` | — |
| `hidePopover` | `void` | — |
| `insertAdjacentElement` | `Element | null` | — |
| `insertAdjacentHTML` | `void` | — |
| `insertAdjacentText` | `void` | — |
| `insertBefore` | `T` | — |
| `isDefaultNamespace` | `boolean` | — |
| `isEqualNode` | `boolean` | — |
| `isSameNode` | `boolean` | — |
| `lookupNamespaceURI` | `string | null` | — |
| `lookupPrefix` | `string | null` | — |
| `matches` | `boolean` | — |
| `normalize` | `void` | — |
| `prepend` | `void` | — |
| `querySelector` | `HTMLElementTagNameMap[K] | null` | — |
| `querySelectorAll` | `NodeListOf<HTMLElementTagNameMap[K]>` | — |
| `releasePointerCapture` | `void` | — |
| `remove` | `void` | — |
| `removeAttribute` | `void` | — |
| `removeAttributeNode` | `Attr` | — |
| `removeAttributeNS` | `void` | — |
| `removeChild` | `T` | — |
| `removeEventListener` | `void` | — |
| `replaceChild` | `T` | — |
| `replaceChildren` | `void` | — |
| `replaceWith` | `void` | — |
| `requestFullscreen` | `Promise<void>` | — |
| `requestPointerLock` | `Promise<void>` | — |
| `scroll` | `void` | — |
| `scrollBy` | `void` | — |
| `scrollIntoView` | `void` | — |
| `scrollTo` | `void` | — |
| `setAttribute` | `void` | — |
| `setAttributeNode` | `Attr | null` | — |
| `setAttributeNodeNS` | `Attr | null` | — |
| `setAttributeNS` | `void` | — |
| `setHTMLUnsafe` | `void` | — |
| `setPointerCapture` | `void` | — |
| `showPopover` | `void` | — |
| `toggleAttribute` | `boolean` | — |
| `togglePopover` | `boolean` | — |
| `webkitMatchesSelector` | `boolean` | — |
| `define` | `void` | — |

---


### `class ThemeKitSelect`

**Extends** `HTMLElement`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `constructor` | `ThemeKitSelect` | — |
| `accessKey` | `string` | The **`HTMLElement.accessKey`** property sets the keystroke which a user can press to jump to a given element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/accessKey) |
| readonly `accessKeyLabel` | `string` | The **`HTMLElement.accessKeyLabel`** read-only property returns a string containing the element's browser-assigned access key (if any); otherwise it returns an empty string.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/accessKeyLabel) |
| `ariaActiveDescendantElement` | `Element | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaActiveDescendantElement) |
| `ariaAtomic` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaAtomic) |
| `ariaAutoComplete` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaAutoComplete) |
| `ariaBrailleLabel` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaBrailleLabel) |
| `ariaBrailleRoleDescription` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaBrailleRoleDescription) |
| `ariaBusy` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaBusy) |
| `ariaChecked` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaChecked) |
| `ariaColCount` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaColCount) |
| `ariaColIndex` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaColIndex) |
| `ariaColIndexText` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaColIndexText) |
| `ariaColSpan` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaColSpan) |
| `ariaControlsElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaControlsElements) |
| `ariaCurrent` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaCurrent) |
| `ariaDescribedByElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaDescribedByElements) |
| `ariaDescription` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaDescription) |
| `ariaDetailsElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaDetailsElements) |
| `ariaDisabled` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaDisabled) |
| `ariaErrorMessageElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaErrorMessageElements) |
| `ariaExpanded` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaExpanded) |
| `ariaFlowToElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaFlowToElements) |
| `ariaHasPopup` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaHasPopup) |
| `ariaHidden` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaHidden) |
| `ariaInvalid` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaInvalid) |
| `ariaKeyShortcuts` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaKeyShortcuts) |
| `ariaLabel` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaLabel) |
| `ariaLabelledByElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaLabelledByElements) |
| `ariaLevel` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaLevel) |
| `ariaLive` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaLive) |
| `ariaModal` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaModal) |
| `ariaMultiLine` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaMultiLine) |
| `ariaMultiSelectable` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaMultiSelectable) |
| `ariaOrientation` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaOrientation) |
| `ariaOwnsElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaOwnsElements) |
| `ariaPlaceholder` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaPlaceholder) |
| `ariaPosInSet` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaPosInSet) |
| `ariaPressed` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaPressed) |
| `ariaReadOnly` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaReadOnly) |
| `ariaRelevant` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRelevant) |
| `ariaRequired` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRequired) |
| `ariaRoleDescription` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRoleDescription) |
| `ariaRowCount` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRowCount) |
| `ariaRowIndex` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRowIndex) |
| `ariaRowIndexText` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRowIndexText) |
| `ariaRowSpan` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRowSpan) |
| `ariaSelected` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaSelected) |
| `ariaSetSize` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaSetSize) |
| `ariaSort` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaSort) |
| `ariaValueMax` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaValueMax) |
| `ariaValueMin` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaValueMin) |
| `ariaValueNow` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaValueNow) |
| `ariaValueText` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaValueText) |
| readonly `assignedSlot` | `HTMLSlotElement | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/assignedSlot) |
| readonly `ATTRIBUTE_NODE` | `2` | — |
| readonly `attributes` | `NamedNodeMap` | The **`Element.attributes`** property returns a live collection of all attribute nodes registered to the specified node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/attributes) |
| readonly `attributeStyleMap` | `StylePropertyMap` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/attributeStyleMap) |
| `autocapitalize` | `string` | The **`autocapitalize`** property of the HTMLElement interface represents the element's capitalization behavior for user input.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/autocapitalize) |
| `autocorrect` | `boolean` | The **`autocorrect`** property of the HTMLElement interface controls whether or not autocorrection of editable text is enabled for spelling and/or punctuation errors.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/autocorrect) |
| `autofocus` | `boolean` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/autofocus) |
| readonly `baseURI` | `string` | The read-only **`baseURI`** property of the Node interface returns the absolute base URL of the document containing the node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/baseURI) |
| readonly `CDATA_SECTION_NODE` | `4` | node is a CDATASection node. |
| readonly `childElementCount` | `number` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/childElementCount) |
| readonly `childNodes` | `NodeListOf<ChildNode>` | The read-only **`childNodes`** property of the Node interface returns a live the first child node is assigned index `0`.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/childNodes) |
| readonly `children` | `HTMLCollection` | Returns the child elements.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/children) |
| `className` | `string` | The **`className`** property of the of the specified element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/className) |
| readonly `clientHeight` | `number` | The **`clientHeight`** read-only property of the Element interface is zero for elements with no CSS or inline layout boxes; otherwise, it's the inner height of an element in pixels.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/clientHeight) |
| readonly `clientLeft` | `number` | The **`clientLeft`** read-only property of the Element interface returns the width of the left border of an element in pixels.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/clientLeft) |
| readonly `clientTop` | `number` | The **`clientTop`** read-only property of the Element interface returns the width of the top border of an element in pixels.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/clientTop) |
| readonly `clientWidth` | `number` | The **`clientWidth`** read-only property of the Element interface is zero for inline elements and elements with no CSS; otherwise, it's the inner width of an element in pixels.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/clientWidth) |
| readonly `COMMENT_NODE` | `8` | node is a Comment node. |
| `contentEditable` | `string` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/contentEditable) |
| readonly `currentCSSZoom` | `number` | The **`currentCSSZoom`** read-only property of the Element interface provides the 'effective' CSS `zoom` of an element, taking into account the zoom applied to the element and all its parent elements.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/currentCSSZoom) |
| readonly `dataset` | `DOMStringMap` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dataset) |
| `dir` | `string` | The **`HTMLElement.dir`** property indicates the text writing directionality of the content of the current element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dir) |
| readonly `DOCUMENT_FRAGMENT_NODE` | `11` | node is a DocumentFragment node. |
| readonly `DOCUMENT_NODE` | `9` | node is a document. |
| readonly `DOCUMENT_POSITION_CONTAINED_BY` | `16` | Set when other is a descendant of node. |
| readonly `DOCUMENT_POSITION_CONTAINS` | `8` | Set when other is an ancestor of node. |
| readonly `DOCUMENT_POSITION_DISCONNECTED` | `1` | Set when node and other are not in the same tree. |
| readonly `DOCUMENT_POSITION_FOLLOWING` | `4` | Set when other is following node. |
| readonly `DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC` | `32` | — |
| readonly `DOCUMENT_POSITION_PRECEDING` | `2` | Set when other is preceding node. |
| readonly `DOCUMENT_TYPE_NODE` | `10` | node is a doctype. |
| `draggable` | `boolean` | The **`draggable`** property of the HTMLElement interface gets and sets a Boolean primitive indicating if the element is draggable.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/draggable) |
| readonly `ELEMENT_NODE` | `1` | node is an element. |
| `enterKeyHint` | `string` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/enterKeyHint) |
| readonly `ENTITY_NODE` | `6` | — |
| readonly `ENTITY_REFERENCE_NODE` | `5` | — |
| readonly `firstChild` | `ChildNode | null` | The read-only **`firstChild`** property of the Node interface returns the node's first child in the tree, or `null` if the node has no children.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/firstChild) |
| readonly `firstElementChild` | `Element | null` | Returns the first child that is an element, and null otherwise.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/firstElementChild) |
| `hidden` | `boolean` | The HTMLElement property **`hidden`** reflects the value of the element's `hidden` attribute.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/hidden) |
| `id` | `string` | The **`id`** property of the Element interface represents the element's identifier, reflecting the **`id`** global attribute.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/id) |
| `inert` | `boolean` | The HTMLElement property **`inert`** reflects the value of the element's `inert` attribute.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/inert) |
| `innerHTML` | `string` | The **`innerHTML`** property of the Element interface gets or sets the HTML or XML markup contained within the element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/innerHTML) |
| `innerText` | `string` | The **`innerText`** property of the HTMLElement interface represents the rendered text content of a node and its descendants.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/innerText) |
| `inputMode` | `string` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/inputMode) |
| readonly `isConnected` | `boolean` | The read-only **`isConnected`** property of the Node interface returns a boolean indicating whether the node is connected (directly or indirectly) to a Document object.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/isConnected) |
| readonly `isContentEditable` | `boolean` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/isContentEditable) |
| `lang` | `string` | The **`lang`** property of the HTMLElement interface indicates the base language of an element's attribute values and text content, in the form of a MISSING: RFC(5646, 'BCP 47 language identifier tag')].

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/lang) |
| readonly `lastChild` | `ChildNode | null` | The read-only **`lastChild`** property of the Node interface returns the last child of the node, or `null` if there are no child nodes.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/lastChild) |
| readonly `lastElementChild` | `Element | null` | Returns the last child that is an element, and null otherwise.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/lastElementChild) |
| readonly `localName` | `string` | The **`Element.localName`** read-only property returns the local part of the qualified name of an element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/localName) |
| readonly `namespaceURI` | `string | null` | The **`Element.namespaceURI`** read-only property returns the namespace URI of the element, or `null` if the element is not in a namespace.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/namespaceURI) |
| readonly `nextElementSibling` | `Element | null` | Returns the first following sibling that is an element, and null otherwise.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/nextElementSibling) |
| readonly `nextSibling` | `ChildNode | null` | The read-only **`nextSibling`** property of the Node interface returns the node immediately following the specified one in their parent's Node.childNodes, or returns `null` if the specified node is the last child in the parent element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nextSibling) |
| readonly `nodeName` | `string` | The read-only **`nodeName`** property of Node returns the name of the current node as a string.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nodeName) |
| readonly `nodeType` | `number` | The read-only **`nodeType`** property of a Node interface is an integer that identifies what the node is.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nodeType) |
| `nodeValue` | `string | null` | The **`nodeValue`** property of the Node interface returns or sets the value of the current node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nodeValue) |
| `nonce` (optional) | `string` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/nonce) |
| readonly `NOTATION_NODE` | `12` | — |
| readonly `offsetHeight` | `number` | The **`offsetHeight`** read-only property of the HTMLElement interface returns the height of an element, including vertical padding and borders, as an integer.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetHeight) |
| readonly `offsetLeft` | `number` | The **`offsetLeft`** read-only property of the HTMLElement interface returns the number of pixels that the _upper left corner_ of the current element is offset to the left within the HTMLElement.offsetParent node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetLeft) |
| readonly `offsetParent` | `Element | null` | The **`HTMLElement.offsetParent`** read-only property returns a reference to the element which is the closest (nearest in the containment hierarchy) positioned ancestor element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetParent) |
| readonly `offsetTop` | `number` | The **`offsetTop`** read-only property of the HTMLElement interface returns the distance from the outer border of the current element (including its margin) to the top padding edge of the HTMLelement.offsetParent, the _closest positioned_ ancestor element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetTop) |
| readonly `offsetWidth` | `number` | The **`offsetWidth`** read-only property of the HTMLElement interface returns the layout width of an element as an integer.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetWidth) |
| `onabort` | `__type(this: GlobalEventHandlers, ev: UIEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/abort_event) |
| `onanimationcancel` | `__type(this: GlobalEventHandlers, ev: AnimationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/animationcancel_event) |
| `onanimationend` | `__type(this: GlobalEventHandlers, ev: AnimationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/animationend_event) |
| `onanimationiteration` | `__type(this: GlobalEventHandlers, ev: AnimationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/animationiteration_event) |
| `onanimationstart` | `__type(this: GlobalEventHandlers, ev: AnimationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/animationstart_event) |
| `onauxclick` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/auxclick_event) |
| `onbeforeinput` | `__type(this: GlobalEventHandlers, ev: InputEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/beforeinput_event) |
| `onbeforematch` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/beforematch_event) |
| `onbeforetoggle` | `__type(this: GlobalEventHandlers, ev: ToggleEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/beforetoggle_event) |
| `onblur` | `__type(this: GlobalEventHandlers, ev: FocusEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/blur_event) |
| `oncancel` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLDialogElement/cancel_event) |
| `oncanplay` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/canplay_event) |
| `oncanplaythrough` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/canplaythrough_event) |
| `onchange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/change_event) |
| `onclick` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/click_event) |
| `onclose` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLDialogElement/close_event) |
| `oncontextlost` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/contextlost_event) |
| `oncontextmenu` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/contextmenu_event) |
| `oncontextrestored` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/contextrestored_event) |
| `oncopy` | `__type(this: GlobalEventHandlers, ev: ClipboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/copy_event) |
| `oncuechange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLTrackElement/cuechange_event) |
| `oncut` | `__type(this: GlobalEventHandlers, ev: ClipboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/cut_event) |
| `ondblclick` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/dblclick_event) |
| `ondrag` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/drag_event) |
| `ondragend` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragend_event) |
| `ondragenter` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragenter_event) |
| `ondragleave` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragleave_event) |
| `ondragover` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragover_event) |
| `ondragstart` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragstart_event) |
| `ondrop` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/drop_event) |
| `ondurationchange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/durationchange_event) |
| `onemptied` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/emptied_event) |
| `onended` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/ended_event) |
| `onerror` | `OnErrorEventHandler` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/error_event) |
| `onfocus` | `__type(this: GlobalEventHandlers, ev: FocusEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/focus_event) |
| `onformdata` | `__type(this: GlobalEventHandlers, ev: FormDataEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLFormElement/formdata_event) |
| `onfullscreenchange` | `__type(this: Element, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/fullscreenchange_event) |
| `onfullscreenerror` | `__type(this: Element, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/fullscreenerror_event) |
| `ongotpointercapture` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/gotpointercapture_event) |
| `oninput` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/input_event) |
| `oninvalid` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLInputElement/invalid_event) |
| `onkeydown` | `__type(this: GlobalEventHandlers, ev: KeyboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/keydown_event) |
| `onkeypress` | `__type(this: GlobalEventHandlers, ev: KeyboardEvent): any | null` | — |
| `onkeyup` | `__type(this: GlobalEventHandlers, ev: KeyboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/keyup_event) |
| `onload` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/load_event) |
| `onloadeddata` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/loadeddata_event) |
| `onloadedmetadata` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/loadedmetadata_event) |
| `onloadstart` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/loadstart_event) |
| `onlostpointercapture` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/lostpointercapture_event) |
| `onmousedown` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mousedown_event) |
| `onmouseenter` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseenter_event) |
| `onmouseleave` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseleave_event) |
| `onmousemove` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mousemove_event) |
| `onmouseout` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseout_event) |
| `onmouseover` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseover_event) |
| `onmouseup` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseup_event) |
| `onpaste` | `__type(this: GlobalEventHandlers, ev: ClipboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/paste_event) |
| `onpause` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/pause_event) |
| `onplay` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/play_event) |
| `onplaying` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/playing_event) |
| `onpointercancel` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointercancel_event) |
| `onpointerdown` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event) |
| `onpointerenter` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event) |
| `onpointerleave` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event) |
| `onpointermove` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointermove_event) |
| `onpointerout` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerout_event) |
| `onpointerover` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerover_event) |
| `onpointerrawupdate` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | Available only in secure contexts.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerrawupdate_event) |
| `onpointerup` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event) |
| `onprogress` | `__type(this: GlobalEventHandlers, ev: ProgressEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/progress_event) |
| `onratechange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/ratechange_event) |
| `onreset` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLFormElement/reset_event) |
| `onresize` | `__type(this: GlobalEventHandlers, ev: UIEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLVideoElement/resize_event) |
| `onscroll` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/scroll_event) |
| `onscrollend` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/scrollend_event) |
| `onsecuritypolicyviolation` | `__type(this: GlobalEventHandlers, ev: SecurityPolicyViolationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/securitypolicyviolation_event) |
| `onseeked` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/seeked_event) |
| `onseeking` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/seeking_event) |
| `onselect` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLInputElement/select_event) |
| `onselectionchange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/selectionchange_event) |
| `onselectstart` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/selectstart_event) |
| `onslotchange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLSlotElement/slotchange_event) |
| `onstalled` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/stalled_event) |
| `onsubmit` | `__type(this: GlobalEventHandlers, ev: SubmitEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLFormElement/submit_event) |
| `onsuspend` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/suspend_event) |
| `ontimeupdate` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/timeupdate_event) |
| `ontoggle` | `__type(this: GlobalEventHandlers, ev: ToggleEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/toggle_event) |
| `ontouchcancel` (optional) | `__type(this: GlobalEventHandlers, ev: TouchEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/touchcancel_event) |
| `ontouchend` (optional) | `__type(this: GlobalEventHandlers, ev: TouchEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/touchend_event) |
| `ontouchmove` (optional) | `__type(this: GlobalEventHandlers, ev: TouchEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/touchmove_event) |
| `ontouchstart` (optional) | `__type(this: GlobalEventHandlers, ev: TouchEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/touchstart_event) |
| `ontransitioncancel` | `__type(this: GlobalEventHandlers, ev: TransitionEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/transitioncancel_event) |
| `ontransitionend` | `__type(this: GlobalEventHandlers, ev: TransitionEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/transitionend_event) |
| `ontransitionrun` | `__type(this: GlobalEventHandlers, ev: TransitionEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/transitionrun_event) |
| `ontransitionstart` | `__type(this: GlobalEventHandlers, ev: TransitionEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/transitionstart_event) |
| `onvolumechange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/volumechange_event) |
| `onwaiting` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/waiting_event) |
| `onwebkitanimationend` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | — |
| `onwebkitanimationiteration` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | — |
| `onwebkitanimationstart` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | — |
| `onwebkittransitionend` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | — |
| `onwheel` | `__type(this: GlobalEventHandlers, ev: WheelEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/wheel_event) |
| `outerHTML` | `string` | The **`outerHTML`** attribute of the Element DOM interface gets the serialized HTML fragment describing the element including its descendants.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/outerHTML) |
| `outerText` | `string` | The **`outerText`** property of the HTMLElement interface returns the same value as HTMLElement.innerText.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/outerText) |
| readonly `ownerDocument` | `Document` | The read-only **`ownerDocument`** property of the Node interface returns the top-level document object of the node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/ownerDocument) |
| readonly `parentElement` | `HTMLElement | null` | The read-only **`parentElement`** property of Node interface returns the DOM node's parent Element, or `null` if the node either has no parent, or its parent isn't a DOM Element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/parentElement) |
| readonly `parentNode` | `ParentNode | null` | The read-only **`parentNode`** property of the Node interface returns the parent of the specified node in the DOM tree.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/parentNode) |
| `popover` | `string | null` | The **`popover`** property of the HTMLElement interface gets and sets an element's popover state via JavaScript (`'auto'`, `'hint'`, or `'manual'`), and can be used for feature detection.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/popover) |
| readonly `prefix` | `string | null` | The **`Element.prefix`** read-only property returns the namespace prefix of the specified element, or `null` if no prefix is specified.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/prefix) |
| readonly `previousElementSibling` | `Element | null` | Returns the first preceding sibling that is an element, and null otherwise.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/previousElementSibling) |
| readonly `previousSibling` | `ChildNode | null` | The read-only **`previousSibling`** property of the Node interface returns the node immediately preceding the specified one in its parent's or `null` if the specified node is the first in that list.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/previousSibling) |
| readonly `PROCESSING_INSTRUCTION_NODE` | `7` | node is a ProcessingInstruction node. |
| `role` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/role) |
| readonly `scrollHeight` | `number` | The **`scrollHeight`** read-only property of the Element interface is a measurement of the height of an element's content, including content not visible on the screen due to overflow.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollHeight) |
| `scrollLeft` | `number` | The **`scrollLeft`** property of the Element interface gets or sets the number of pixels by which an element's content is scrolled from its left edge.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollLeft) |
| `scrollTop` | `number` | The **`scrollTop`** property of the Element interface gets or sets the number of pixels by which an element's content is scrolled from its top edge.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollTop) |
| readonly `scrollWidth` | `number` | The **`scrollWidth`** read-only property of the Element interface is a measurement of the width of an element's content, including content not visible on the screen due to overflow.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollWidth) |
| readonly `shadowRoot` | `ShadowRoot | null` | The `Element.shadowRoot` read-only property represents the shadow root hosted by the element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/shadowRoot) |
| `slot` | `string` | The **`slot`** property of the Element interface returns the name of the shadow DOM slot the element is inserted in.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/slot) |
| `spellcheck` | `boolean` | The **`spellcheck`** property of the HTMLElement interface represents a boolean value that controls the spell-checking hint.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/spellcheck) |
| `tabIndex` | `number` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/tabIndex) |
| readonly `tagName` | `string` | The **`tagName`** read-only property of the Element interface returns the tag name of the element on which it's called.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/tagName) |
| readonly `TEXT_NODE` | `3` | node is a Text node. |
| `title` | `string` | The **`HTMLElement.title`** property represents the title of the element: the text usually displayed in a 'tooltip' popup when the mouse is over the node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/title) |
| `translate` | `boolean` | The **`translate`** property of the HTMLElement interface indicates whether an element's attribute values and the values of its Text node children are to be translated when the page is localized, or whether to leave them unchanged.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/translate) |
| `writingSuggestions` | `string` | The **`writingSuggestions`** property of the HTMLElement interface is a string indicating if browser-provided writing suggestions should be enabled under the scope of the element or not.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/writingSuggestions) |
| `observedAttributes` | `string[]` | — |
| `classList` | `void` | — |
| `part` | `void` | — |
| `style` | `void` | — |
| `textContent` | `void` | — |
| `addEventListener` | `void` | — |
| `after` | `void` | — |
| `animate` | `Animation` | — |
| `append` | `void` | — |
| `appendChild` | `T` | — |
| `attachInternals` | `ElementInternals` | — |
| `attachShadow` | `ShadowRoot` | — |
| `attributeChangedCallback` | `void` | — |
| `before` | `void` | — |
| `blur` | `void` | — |
| `checkVisibility` | `boolean` | — |
| `click` | `void` | — |
| `cloneNode` | `Node` | — |
| `closest` | `HTMLElementTagNameMap[K] | null` | — |
| `compareDocumentPosition` | `number` | — |
| `computedStyleMap` | `StylePropertyMapReadOnly` | — |
| `connectedCallback` | `void` | — |
| `contains` | `boolean` | — |
| `disconnectedCallback` | `void` | — |
| `dispatchEvent` | `boolean` | — |
| `focus` | `void` | — |
| `getAnimations` | `Animation[]` | — |
| `getAttribute` | `string | null` | — |
| `getAttributeNames` | `string[]` | — |
| `getAttributeNode` | `Attr | null` | — |
| `getAttributeNodeNS` | `Attr | null` | — |
| `getAttributeNS` | `string | null` | — |
| `getBoundingClientRect` | `DOMRect` | — |
| `getClientRects` | `DOMRectList` | — |
| `getElementsByClassName` | `HTMLCollectionOf<Element>` | — |
| `getElementsByTagName` | `HTMLCollectionOf<HTMLElementTagNameMap[K]>` | — |
| `getElementsByTagNameNS` | `HTMLCollectionOf<HTMLElement>` | — |
| `getHTML` | `string` | — |
| `getRootNode` | `Node` | — |
| `hasAttribute` | `boolean` | — |
| `hasAttributeNS` | `boolean` | — |
| `hasAttributes` | `boolean` | — |
| `hasChildNodes` | `boolean` | — |
| `hasPointerCapture` | `boolean` | — |
| `hidePopover` | `void` | — |
| `insertAdjacentElement` | `Element | null` | — |
| `insertAdjacentHTML` | `void` | — |
| `insertAdjacentText` | `void` | — |
| `insertBefore` | `T` | — |
| `isDefaultNamespace` | `boolean` | — |
| `isEqualNode` | `boolean` | — |
| `isSameNode` | `boolean` | — |
| `lookupNamespaceURI` | `string | null` | — |
| `lookupPrefix` | `string | null` | — |
| `matches` | `boolean` | — |
| `normalize` | `void` | — |
| `prepend` | `void` | — |
| `querySelector` | `HTMLElementTagNameMap[K] | null` | — |
| `querySelectorAll` | `NodeListOf<HTMLElementTagNameMap[K]>` | — |
| `releasePointerCapture` | `void` | — |
| `remove` | `void` | — |
| `removeAttribute` | `void` | — |
| `removeAttributeNode` | `Attr` | — |
| `removeAttributeNS` | `void` | — |
| `removeChild` | `T` | — |
| `removeEventListener` | `void` | — |
| `replaceChild` | `T` | — |
| `replaceChildren` | `void` | — |
| `replaceWith` | `void` | — |
| `requestFullscreen` | `Promise<void>` | — |
| `requestPointerLock` | `Promise<void>` | — |
| `scroll` | `void` | — |
| `scrollBy` | `void` | — |
| `scrollIntoView` | `void` | — |
| `scrollTo` | `void` | — |
| `setAttribute` | `void` | — |
| `setAttributeNode` | `Attr | null` | — |
| `setAttributeNodeNS` | `Attr | null` | — |
| `setAttributeNS` | `void` | — |
| `setHTMLUnsafe` | `void` | — |
| `setPointerCapture` | `void` | — |
| `showPopover` | `void` | — |
| `toggleAttribute` | `boolean` | — |
| `togglePopover` | `boolean` | — |
| `webkitMatchesSelector` | `boolean` | — |
| `define` | `void` | — |

---


### `class ThemeKitToggle`

**Extends** `HTMLElement`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `constructor` | `ThemeKitToggle` | — |
| `accessKey` | `string` | The **`HTMLElement.accessKey`** property sets the keystroke which a user can press to jump to a given element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/accessKey) |
| readonly `accessKeyLabel` | `string` | The **`HTMLElement.accessKeyLabel`** read-only property returns a string containing the element's browser-assigned access key (if any); otherwise it returns an empty string.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/accessKeyLabel) |
| `ariaActiveDescendantElement` | `Element | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaActiveDescendantElement) |
| `ariaAtomic` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaAtomic) |
| `ariaAutoComplete` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaAutoComplete) |
| `ariaBrailleLabel` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaBrailleLabel) |
| `ariaBrailleRoleDescription` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaBrailleRoleDescription) |
| `ariaBusy` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaBusy) |
| `ariaChecked` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaChecked) |
| `ariaColCount` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaColCount) |
| `ariaColIndex` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaColIndex) |
| `ariaColIndexText` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaColIndexText) |
| `ariaColSpan` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaColSpan) |
| `ariaControlsElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaControlsElements) |
| `ariaCurrent` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaCurrent) |
| `ariaDescribedByElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaDescribedByElements) |
| `ariaDescription` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaDescription) |
| `ariaDetailsElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaDetailsElements) |
| `ariaDisabled` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaDisabled) |
| `ariaErrorMessageElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaErrorMessageElements) |
| `ariaExpanded` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaExpanded) |
| `ariaFlowToElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaFlowToElements) |
| `ariaHasPopup` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaHasPopup) |
| `ariaHidden` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaHidden) |
| `ariaInvalid` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaInvalid) |
| `ariaKeyShortcuts` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaKeyShortcuts) |
| `ariaLabel` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaLabel) |
| `ariaLabelledByElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaLabelledByElements) |
| `ariaLevel` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaLevel) |
| `ariaLive` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaLive) |
| `ariaModal` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaModal) |
| `ariaMultiLine` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaMultiLine) |
| `ariaMultiSelectable` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaMultiSelectable) |
| `ariaOrientation` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaOrientation) |
| `ariaOwnsElements` | `readonly Element[] | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaOwnsElements) |
| `ariaPlaceholder` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaPlaceholder) |
| `ariaPosInSet` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaPosInSet) |
| `ariaPressed` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaPressed) |
| `ariaReadOnly` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaReadOnly) |
| `ariaRelevant` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRelevant) |
| `ariaRequired` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRequired) |
| `ariaRoleDescription` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRoleDescription) |
| `ariaRowCount` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRowCount) |
| `ariaRowIndex` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRowIndex) |
| `ariaRowIndexText` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRowIndexText) |
| `ariaRowSpan` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaRowSpan) |
| `ariaSelected` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaSelected) |
| `ariaSetSize` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaSetSize) |
| `ariaSort` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaSort) |
| `ariaValueMax` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaValueMax) |
| `ariaValueMin` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaValueMin) |
| `ariaValueNow` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaValueNow) |
| `ariaValueText` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/ariaValueText) |
| readonly `assignedSlot` | `HTMLSlotElement | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/assignedSlot) |
| readonly `ATTRIBUTE_NODE` | `2` | — |
| readonly `attributes` | `NamedNodeMap` | The **`Element.attributes`** property returns a live collection of all attribute nodes registered to the specified node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/attributes) |
| readonly `attributeStyleMap` | `StylePropertyMap` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/attributeStyleMap) |
| `autocapitalize` | `string` | The **`autocapitalize`** property of the HTMLElement interface represents the element's capitalization behavior for user input.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/autocapitalize) |
| `autocorrect` | `boolean` | The **`autocorrect`** property of the HTMLElement interface controls whether or not autocorrection of editable text is enabled for spelling and/or punctuation errors.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/autocorrect) |
| `autofocus` | `boolean` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/autofocus) |
| readonly `baseURI` | `string` | The read-only **`baseURI`** property of the Node interface returns the absolute base URL of the document containing the node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/baseURI) |
| readonly `CDATA_SECTION_NODE` | `4` | node is a CDATASection node. |
| readonly `childElementCount` | `number` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/childElementCount) |
| readonly `childNodes` | `NodeListOf<ChildNode>` | The read-only **`childNodes`** property of the Node interface returns a live the first child node is assigned index `0`.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/childNodes) |
| readonly `children` | `HTMLCollection` | Returns the child elements.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/children) |
| `className` | `string` | The **`className`** property of the of the specified element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/className) |
| readonly `clientHeight` | `number` | The **`clientHeight`** read-only property of the Element interface is zero for elements with no CSS or inline layout boxes; otherwise, it's the inner height of an element in pixels.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/clientHeight) |
| readonly `clientLeft` | `number` | The **`clientLeft`** read-only property of the Element interface returns the width of the left border of an element in pixels.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/clientLeft) |
| readonly `clientTop` | `number` | The **`clientTop`** read-only property of the Element interface returns the width of the top border of an element in pixels.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/clientTop) |
| readonly `clientWidth` | `number` | The **`clientWidth`** read-only property of the Element interface is zero for inline elements and elements with no CSS; otherwise, it's the inner width of an element in pixels.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/clientWidth) |
| readonly `COMMENT_NODE` | `8` | node is a Comment node. |
| `contentEditable` | `string` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/contentEditable) |
| readonly `currentCSSZoom` | `number` | The **`currentCSSZoom`** read-only property of the Element interface provides the 'effective' CSS `zoom` of an element, taking into account the zoom applied to the element and all its parent elements.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/currentCSSZoom) |
| readonly `dataset` | `DOMStringMap` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dataset) |
| `dir` | `string` | The **`HTMLElement.dir`** property indicates the text writing directionality of the content of the current element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dir) |
| readonly `DOCUMENT_FRAGMENT_NODE` | `11` | node is a DocumentFragment node. |
| readonly `DOCUMENT_NODE` | `9` | node is a document. |
| readonly `DOCUMENT_POSITION_CONTAINED_BY` | `16` | Set when other is a descendant of node. |
| readonly `DOCUMENT_POSITION_CONTAINS` | `8` | Set when other is an ancestor of node. |
| readonly `DOCUMENT_POSITION_DISCONNECTED` | `1` | Set when node and other are not in the same tree. |
| readonly `DOCUMENT_POSITION_FOLLOWING` | `4` | Set when other is following node. |
| readonly `DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC` | `32` | — |
| readonly `DOCUMENT_POSITION_PRECEDING` | `2` | Set when other is preceding node. |
| readonly `DOCUMENT_TYPE_NODE` | `10` | node is a doctype. |
| `draggable` | `boolean` | The **`draggable`** property of the HTMLElement interface gets and sets a Boolean primitive indicating if the element is draggable.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/draggable) |
| readonly `ELEMENT_NODE` | `1` | node is an element. |
| `enterKeyHint` | `string` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/enterKeyHint) |
| readonly `ENTITY_NODE` | `6` | — |
| readonly `ENTITY_REFERENCE_NODE` | `5` | — |
| readonly `firstChild` | `ChildNode | null` | The read-only **`firstChild`** property of the Node interface returns the node's first child in the tree, or `null` if the node has no children.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/firstChild) |
| readonly `firstElementChild` | `Element | null` | Returns the first child that is an element, and null otherwise.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/firstElementChild) |
| `hidden` | `boolean` | The HTMLElement property **`hidden`** reflects the value of the element's `hidden` attribute.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/hidden) |
| `id` | `string` | The **`id`** property of the Element interface represents the element's identifier, reflecting the **`id`** global attribute.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/id) |
| `inert` | `boolean` | The HTMLElement property **`inert`** reflects the value of the element's `inert` attribute.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/inert) |
| `innerHTML` | `string` | The **`innerHTML`** property of the Element interface gets or sets the HTML or XML markup contained within the element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/innerHTML) |
| `innerText` | `string` | The **`innerText`** property of the HTMLElement interface represents the rendered text content of a node and its descendants.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/innerText) |
| `inputMode` | `string` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/inputMode) |
| readonly `isConnected` | `boolean` | The read-only **`isConnected`** property of the Node interface returns a boolean indicating whether the node is connected (directly or indirectly) to a Document object.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/isConnected) |
| readonly `isContentEditable` | `boolean` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/isContentEditable) |
| `lang` | `string` | The **`lang`** property of the HTMLElement interface indicates the base language of an element's attribute values and text content, in the form of a MISSING: RFC(5646, 'BCP 47 language identifier tag')].

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/lang) |
| readonly `lastChild` | `ChildNode | null` | The read-only **`lastChild`** property of the Node interface returns the last child of the node, or `null` if there are no child nodes.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/lastChild) |
| readonly `lastElementChild` | `Element | null` | Returns the last child that is an element, and null otherwise.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/lastElementChild) |
| readonly `localName` | `string` | The **`Element.localName`** read-only property returns the local part of the qualified name of an element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/localName) |
| readonly `namespaceURI` | `string | null` | The **`Element.namespaceURI`** read-only property returns the namespace URI of the element, or `null` if the element is not in a namespace.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/namespaceURI) |
| readonly `nextElementSibling` | `Element | null` | Returns the first following sibling that is an element, and null otherwise.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/nextElementSibling) |
| readonly `nextSibling` | `ChildNode | null` | The read-only **`nextSibling`** property of the Node interface returns the node immediately following the specified one in their parent's Node.childNodes, or returns `null` if the specified node is the last child in the parent element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nextSibling) |
| readonly `nodeName` | `string` | The read-only **`nodeName`** property of Node returns the name of the current node as a string.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nodeName) |
| readonly `nodeType` | `number` | The read-only **`nodeType`** property of a Node interface is an integer that identifies what the node is.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nodeType) |
| `nodeValue` | `string | null` | The **`nodeValue`** property of the Node interface returns or sets the value of the current node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/nodeValue) |
| `nonce` (optional) | `string` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/nonce) |
| readonly `NOTATION_NODE` | `12` | — |
| readonly `offsetHeight` | `number` | The **`offsetHeight`** read-only property of the HTMLElement interface returns the height of an element, including vertical padding and borders, as an integer.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetHeight) |
| readonly `offsetLeft` | `number` | The **`offsetLeft`** read-only property of the HTMLElement interface returns the number of pixels that the _upper left corner_ of the current element is offset to the left within the HTMLElement.offsetParent node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetLeft) |
| readonly `offsetParent` | `Element | null` | The **`HTMLElement.offsetParent`** read-only property returns a reference to the element which is the closest (nearest in the containment hierarchy) positioned ancestor element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetParent) |
| readonly `offsetTop` | `number` | The **`offsetTop`** read-only property of the HTMLElement interface returns the distance from the outer border of the current element (including its margin) to the top padding edge of the HTMLelement.offsetParent, the _closest positioned_ ancestor element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetTop) |
| readonly `offsetWidth` | `number` | The **`offsetWidth`** read-only property of the HTMLElement interface returns the layout width of an element as an integer.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/offsetWidth) |
| `onabort` | `__type(this: GlobalEventHandlers, ev: UIEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/abort_event) |
| `onanimationcancel` | `__type(this: GlobalEventHandlers, ev: AnimationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/animationcancel_event) |
| `onanimationend` | `__type(this: GlobalEventHandlers, ev: AnimationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/animationend_event) |
| `onanimationiteration` | `__type(this: GlobalEventHandlers, ev: AnimationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/animationiteration_event) |
| `onanimationstart` | `__type(this: GlobalEventHandlers, ev: AnimationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/animationstart_event) |
| `onauxclick` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/auxclick_event) |
| `onbeforeinput` | `__type(this: GlobalEventHandlers, ev: InputEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/beforeinput_event) |
| `onbeforematch` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/beforematch_event) |
| `onbeforetoggle` | `__type(this: GlobalEventHandlers, ev: ToggleEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/beforetoggle_event) |
| `onblur` | `__type(this: GlobalEventHandlers, ev: FocusEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/blur_event) |
| `oncancel` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLDialogElement/cancel_event) |
| `oncanplay` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/canplay_event) |
| `oncanplaythrough` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/canplaythrough_event) |
| `onchange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/change_event) |
| `onclick` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/click_event) |
| `onclose` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLDialogElement/close_event) |
| `oncontextlost` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/contextlost_event) |
| `oncontextmenu` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/contextmenu_event) |
| `oncontextrestored` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLCanvasElement/contextrestored_event) |
| `oncopy` | `__type(this: GlobalEventHandlers, ev: ClipboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/copy_event) |
| `oncuechange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLTrackElement/cuechange_event) |
| `oncut` | `__type(this: GlobalEventHandlers, ev: ClipboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/cut_event) |
| `ondblclick` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/dblclick_event) |
| `ondrag` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/drag_event) |
| `ondragend` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragend_event) |
| `ondragenter` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragenter_event) |
| `ondragleave` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragleave_event) |
| `ondragover` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragover_event) |
| `ondragstart` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/dragstart_event) |
| `ondrop` | `__type(this: GlobalEventHandlers, ev: DragEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/drop_event) |
| `ondurationchange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/durationchange_event) |
| `onemptied` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/emptied_event) |
| `onended` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/ended_event) |
| `onerror` | `OnErrorEventHandler` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/error_event) |
| `onfocus` | `__type(this: GlobalEventHandlers, ev: FocusEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/focus_event) |
| `onformdata` | `__type(this: GlobalEventHandlers, ev: FormDataEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLFormElement/formdata_event) |
| `onfullscreenchange` | `__type(this: Element, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/fullscreenchange_event) |
| `onfullscreenerror` | `__type(this: Element, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/fullscreenerror_event) |
| `ongotpointercapture` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/gotpointercapture_event) |
| `oninput` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/input_event) |
| `oninvalid` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLInputElement/invalid_event) |
| `onkeydown` | `__type(this: GlobalEventHandlers, ev: KeyboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/keydown_event) |
| `onkeypress` | `__type(this: GlobalEventHandlers, ev: KeyboardEvent): any | null` | — |
| `onkeyup` | `__type(this: GlobalEventHandlers, ev: KeyboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/keyup_event) |
| `onload` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/load_event) |
| `onloadeddata` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/loadeddata_event) |
| `onloadedmetadata` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/loadedmetadata_event) |
| `onloadstart` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/loadstart_event) |
| `onlostpointercapture` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/lostpointercapture_event) |
| `onmousedown` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mousedown_event) |
| `onmouseenter` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseenter_event) |
| `onmouseleave` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseleave_event) |
| `onmousemove` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mousemove_event) |
| `onmouseout` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseout_event) |
| `onmouseover` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseover_event) |
| `onmouseup` | `__type(this: GlobalEventHandlers, ev: MouseEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/mouseup_event) |
| `onpaste` | `__type(this: GlobalEventHandlers, ev: ClipboardEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/paste_event) |
| `onpause` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/pause_event) |
| `onplay` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/play_event) |
| `onplaying` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/playing_event) |
| `onpointercancel` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointercancel_event) |
| `onpointerdown` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerdown_event) |
| `onpointerenter` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerenter_event) |
| `onpointerleave` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerleave_event) |
| `onpointermove` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointermove_event) |
| `onpointerout` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerout_event) |
| `onpointerover` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerover_event) |
| `onpointerrawupdate` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | Available only in secure contexts.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerrawupdate_event) |
| `onpointerup` | `__type(this: GlobalEventHandlers, ev: PointerEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/pointerup_event) |
| `onprogress` | `__type(this: GlobalEventHandlers, ev: ProgressEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/progress_event) |
| `onratechange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/ratechange_event) |
| `onreset` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLFormElement/reset_event) |
| `onresize` | `__type(this: GlobalEventHandlers, ev: UIEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLVideoElement/resize_event) |
| `onscroll` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/scroll_event) |
| `onscrollend` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/scrollend_event) |
| `onsecuritypolicyviolation` | `__type(this: GlobalEventHandlers, ev: SecurityPolicyViolationEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/securitypolicyviolation_event) |
| `onseeked` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/seeked_event) |
| `onseeking` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/seeking_event) |
| `onselect` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLInputElement/select_event) |
| `onselectionchange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Document/selectionchange_event) |
| `onselectstart` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/selectstart_event) |
| `onslotchange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLSlotElement/slotchange_event) |
| `onstalled` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/stalled_event) |
| `onsubmit` | `__type(this: GlobalEventHandlers, ev: SubmitEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLFormElement/submit_event) |
| `onsuspend` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/suspend_event) |
| `ontimeupdate` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/timeupdate_event) |
| `ontoggle` | `__type(this: GlobalEventHandlers, ev: ToggleEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/toggle_event) |
| `ontouchcancel` (optional) | `__type(this: GlobalEventHandlers, ev: TouchEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/touchcancel_event) |
| `ontouchend` (optional) | `__type(this: GlobalEventHandlers, ev: TouchEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/touchend_event) |
| `ontouchmove` (optional) | `__type(this: GlobalEventHandlers, ev: TouchEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/touchmove_event) |
| `ontouchstart` (optional) | `__type(this: GlobalEventHandlers, ev: TouchEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/touchstart_event) |
| `ontransitioncancel` | `__type(this: GlobalEventHandlers, ev: TransitionEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/transitioncancel_event) |
| `ontransitionend` | `__type(this: GlobalEventHandlers, ev: TransitionEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/transitionend_event) |
| `ontransitionrun` | `__type(this: GlobalEventHandlers, ev: TransitionEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/transitionrun_event) |
| `ontransitionstart` | `__type(this: GlobalEventHandlers, ev: TransitionEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/transitionstart_event) |
| `onvolumechange` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/volumechange_event) |
| `onwaiting` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLMediaElement/waiting_event) |
| `onwebkitanimationend` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | — |
| `onwebkitanimationiteration` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | — |
| `onwebkitanimationstart` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | — |
| `onwebkittransitionend` | `__type(this: GlobalEventHandlers, ev: Event): any | null` | — |
| `onwheel` | `__type(this: GlobalEventHandlers, ev: WheelEvent): any | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/wheel_event) |
| `outerHTML` | `string` | The **`outerHTML`** attribute of the Element DOM interface gets the serialized HTML fragment describing the element including its descendants.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/outerHTML) |
| `outerText` | `string` | The **`outerText`** property of the HTMLElement interface returns the same value as HTMLElement.innerText.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/outerText) |
| readonly `ownerDocument` | `Document` | The read-only **`ownerDocument`** property of the Node interface returns the top-level document object of the node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/ownerDocument) |
| readonly `parentElement` | `HTMLElement | null` | The read-only **`parentElement`** property of Node interface returns the DOM node's parent Element, or `null` if the node either has no parent, or its parent isn't a DOM Element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/parentElement) |
| readonly `parentNode` | `ParentNode | null` | The read-only **`parentNode`** property of the Node interface returns the parent of the specified node in the DOM tree.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/parentNode) |
| `popover` | `string | null` | The **`popover`** property of the HTMLElement interface gets and sets an element's popover state via JavaScript (`'auto'`, `'hint'`, or `'manual'`), and can be used for feature detection.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/popover) |
| readonly `prefix` | `string | null` | The **`Element.prefix`** read-only property returns the namespace prefix of the specified element, or `null` if no prefix is specified.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/prefix) |
| readonly `previousElementSibling` | `Element | null` | Returns the first preceding sibling that is an element, and null otherwise.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/CharacterData/previousElementSibling) |
| readonly `previousSibling` | `ChildNode | null` | The read-only **`previousSibling`** property of the Node interface returns the node immediately preceding the specified one in its parent's or `null` if the specified node is the first in that list.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Node/previousSibling) |
| readonly `PROCESSING_INSTRUCTION_NODE` | `7` | node is a ProcessingInstruction node. |
| `role` | `string | null` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/role) |
| readonly `scrollHeight` | `number` | The **`scrollHeight`** read-only property of the Element interface is a measurement of the height of an element's content, including content not visible on the screen due to overflow.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollHeight) |
| `scrollLeft` | `number` | The **`scrollLeft`** property of the Element interface gets or sets the number of pixels by which an element's content is scrolled from its left edge.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollLeft) |
| `scrollTop` | `number` | The **`scrollTop`** property of the Element interface gets or sets the number of pixels by which an element's content is scrolled from its top edge.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollTop) |
| readonly `scrollWidth` | `number` | The **`scrollWidth`** read-only property of the Element interface is a measurement of the width of an element's content, including content not visible on the screen due to overflow.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/scrollWidth) |
| readonly `shadowRoot` | `ShadowRoot | null` | The `Element.shadowRoot` read-only property represents the shadow root hosted by the element.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/shadowRoot) |
| `slot` | `string` | The **`slot`** property of the Element interface returns the name of the shadow DOM slot the element is inserted in.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/slot) |
| `spellcheck` | `boolean` | The **`spellcheck`** property of the HTMLElement interface represents a boolean value that controls the spell-checking hint.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/spellcheck) |
| `tabIndex` | `number` | [MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/tabIndex) |
| readonly `tagName` | `string` | The **`tagName`** read-only property of the Element interface returns the tag name of the element on which it's called.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Element/tagName) |
| readonly `TEXT_NODE` | `3` | node is a Text node. |
| `title` | `string` | The **`HTMLElement.title`** property represents the title of the element: the text usually displayed in a 'tooltip' popup when the mouse is over the node.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/title) |
| `translate` | `boolean` | The **`translate`** property of the HTMLElement interface indicates whether an element's attribute values and the values of its Text node children are to be translated when the page is localized, or whether to leave them unchanged.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/translate) |
| `writingSuggestions` | `string` | The **`writingSuggestions`** property of the HTMLElement interface is a string indicating if browser-provided writing suggestions should be enabled under the scope of the element or not.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/HTMLElement/writingSuggestions) |
| `classList` | `void` | — |
| `part` | `void` | — |
| `style` | `void` | — |
| `textContent` | `void` | — |
| `addEventListener` | `void` | — |
| `after` | `void` | — |
| `animate` | `Animation` | — |
| `append` | `void` | — |
| `appendChild` | `T` | — |
| `attachInternals` | `ElementInternals` | — |
| `attachShadow` | `ShadowRoot` | — |
| `before` | `void` | — |
| `blur` | `void` | — |
| `checkVisibility` | `boolean` | — |
| `click` | `void` | — |
| `cloneNode` | `Node` | — |
| `closest` | `HTMLElementTagNameMap[K] | null` | — |
| `compareDocumentPosition` | `number` | — |
| `computedStyleMap` | `StylePropertyMapReadOnly` | — |
| `connectedCallback` | `void` | — |
| `contains` | `boolean` | — |
| `disconnectedCallback` | `void` | — |
| `dispatchEvent` | `boolean` | — |
| `focus` | `void` | — |
| `getAnimations` | `Animation[]` | — |
| `getAttribute` | `string | null` | — |
| `getAttributeNames` | `string[]` | — |
| `getAttributeNode` | `Attr | null` | — |
| `getAttributeNodeNS` | `Attr | null` | — |
| `getAttributeNS` | `string | null` | — |
| `getBoundingClientRect` | `DOMRect` | — |
| `getClientRects` | `DOMRectList` | — |
| `getElementsByClassName` | `HTMLCollectionOf<Element>` | — |
| `getElementsByTagName` | `HTMLCollectionOf<HTMLElementTagNameMap[K]>` | — |
| `getElementsByTagNameNS` | `HTMLCollectionOf<HTMLElement>` | — |
| `getHTML` | `string` | — |
| `getRootNode` | `Node` | — |
| `hasAttribute` | `boolean` | — |
| `hasAttributeNS` | `boolean` | — |
| `hasAttributes` | `boolean` | — |
| `hasChildNodes` | `boolean` | — |
| `hasPointerCapture` | `boolean` | — |
| `hidePopover` | `void` | — |
| `insertAdjacentElement` | `Element | null` | — |
| `insertAdjacentHTML` | `void` | — |
| `insertAdjacentText` | `void` | — |
| `insertBefore` | `T` | — |
| `isDefaultNamespace` | `boolean` | — |
| `isEqualNode` | `boolean` | — |
| `isSameNode` | `boolean` | — |
| `lookupNamespaceURI` | `string | null` | — |
| `lookupPrefix` | `string | null` | — |
| `matches` | `boolean` | — |
| `normalize` | `void` | — |
| `prepend` | `void` | — |
| `querySelector` | `HTMLElementTagNameMap[K] | null` | — |
| `querySelectorAll` | `NodeListOf<HTMLElementTagNameMap[K]>` | — |
| `releasePointerCapture` | `void` | — |
| `remove` | `void` | — |
| `removeAttribute` | `void` | — |
| `removeAttributeNode` | `Attr` | — |
| `removeAttributeNS` | `void` | — |
| `removeChild` | `T` | — |
| `removeEventListener` | `void` | — |
| `replaceChild` | `T` | — |
| `replaceChildren` | `void` | — |
| `replaceWith` | `void` | — |
| `requestFullscreen` | `Promise<void>` | — |
| `requestPointerLock` | `Promise<void>` | — |
| `scroll` | `void` | — |
| `scrollBy` | `void` | — |
| `scrollIntoView` | `void` | — |
| `scrollTo` | `void` | — |
| `setAttribute` | `void` | — |
| `setAttributeNode` | `Attr | null` | — |
| `setAttributeNodeNS` | `Attr | null` | — |
| `setAttributeNS` | `void` | — |
| `setHTMLUnsafe` | `void` | — |
| `setPointerCapture` | `void` | — |
| `showPopover` | `void` | — |
| `toggleAttribute` | `boolean` | — |
| `togglePopover` | `boolean` | — |
| `webkitMatchesSelector` | `boolean` | — |
| `define` | `void` | — |

---

## Interfaces

### `ThemeKitProviderProps`
| Member | Type | Description |
| ------ | ---- | ----------- |
| `defaultTheme` (optional) | `string` | — |
| `scheduled` (optional) | `ThemeScheduleOptions<ThemeDefinition<string>>` | — |
| `themes` (optional) | `readonly ThemeDefinition<string>[]` | — |

---
