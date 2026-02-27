import { IConfigurableFormComponent } from "@/providers";

export interface IShadowComponentProps extends IConfigurableFormComponent {
  value?: IShadowValue;
  onChange?: Function;
  readonly?: boolean;
};

export interface IShadowValue {
  offsetX?: string | number;
  offsetY?: string | number;
  blurRadius?: string | number;
  spreadRadius?: string | number;
  color: string;
}
