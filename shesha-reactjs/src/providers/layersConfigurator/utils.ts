import { ILayerGroup, LayerGroupItemProps } from './models';

export interface IItemPosition {
  ownerArray: LayerGroupItemProps[];
  index: number;
}

export const getItemById = (items: LayerGroupItemProps[], id: string): LayerGroupItemProps => {
  const position = getItemPositionById(items, id);
  return position ? position.ownerArray[position.index] : null;
};

export const getItemPositionById = (items: LayerGroupItemProps[], id: string): IItemPosition => {
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    if (item.id === id)
      return {
        ownerArray: items,
        index,
      };

    const children = (item as ILayerGroup)?.childItems;

    if (children) {
      const itemPosition = getItemPositionById(children, id);
      if (itemPosition) return itemPosition;
    }
  }

  return null;
};