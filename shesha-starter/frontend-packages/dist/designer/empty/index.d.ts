import { IConfigurableFormComponent, IToolboxComponent } from '@shesha-io/reactjs';
export interface IEmptyProps extends IConfigurableFormComponent {
    description: string;
    image?: string;
    imageStyle?: boolean;
    imageSize?: number;
}
declare const EmptyComponent: IToolboxComponent<IEmptyProps>;
export default EmptyComponent;
//# sourceMappingURL=index.d.ts.map