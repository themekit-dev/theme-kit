import {
  Component,
  Input,
  HostBinding,
  CUSTOM_ELEMENTS_SCHEMA,
  type OnInit,
} from "@angular/core";
import { ThemeKitInspector } from "@theme-kit/web";

@Component({
  selector: "theme-kit-inspector-component",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<theme-kit-inspector
    [attr.bottom]="bottom"
    [attr.right]="right"
    [attr.size]="size"
    [attr.z-index]="zIndex"
    [class]="class"
    [style]="style"
  ></theme-kit-inspector>`,
})
export class ThemeInspectorComponent implements OnInit {
  @Input() bottom?: number;
  @Input() right?: number;
  @Input() size?: number;
  @Input() zIndex?: number;
  /** CSS classes forwarded to the <theme-kit-inspector> element. */
  @HostBinding("class") @Input() class?: string;
  /** Inline styles forwarded to the <theme-kit-inspector> element. */
  @HostBinding("style") @Input() style?: string;

  ngOnInit() {
    ThemeKitInspector.define();
  }
}