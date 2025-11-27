
import { useState } from 'react';
import { MenuDataItem } from '@ant-design/pro-layout';

interface DropdownVisibleState {
  [key: number]: { visible: boolean; data: any };
}

export const useUIState = () => {
  const [siderWidth, setSiderWidth] = useState(320);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [isMenuDropdownVisible, setIsMenuDropdownVisible] = useState<MenuDataItem>();
  const [singleDropdownVisible, setSingleDropdownVisible] = useState<DropdownVisibleState>({});
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [updateCounter, setUpdateCounter] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);

  const toggleEditMode = () => setIsEditMode(!isEditMode);

  const forceUpdateTreeChart = () => {
    setUpdateCounter((prevCounter) => prevCounter + 1);
  };

  const handleVisibleChange = (item: MenuDataItem, flag: boolean) => {
    setIsMenuDropdownVisible(item);
    setSingleDropdownVisible((prev) => ({
      ...prev,
      [Number(item.key)]: {
        visible: flag,
        data: item,
      },
    }));
  };

  return {
    siderWidth,
    setSiderWidth,
    isModalVisible,
    setIsModalVisible,
    popoverVisible,
    setPopoverVisible,
    isMenuDropdownVisible,
    setIsMenuDropdownVisible,
    singleDropdownVisible,
    setSingleDropdownVisible,
    editingKey,
    setEditingKey,
    updateCounter,
    forceUpdateTreeChart,
    isEditMode,
    toggleEditMode,
    handleVisibleChange,
  };
};
