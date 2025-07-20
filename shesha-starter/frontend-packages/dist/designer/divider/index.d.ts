import { IConfigurableFormComponent, IToolboxComponent } from '@shesha-io/reactjs';
export interface IDividerProps extends IConfigurableFormComponent {
    dividerType?: 'horizontal' | 'vertical';
    dashed?: boolean;
}
declare const DividerComponent: IToolboxComponent<IDividerProps>;
export default DividerComponent;
//# sourceMappingURL=index.d.ts.map