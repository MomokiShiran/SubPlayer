import { Store } from 'react-notifications-component';

export const notify = (obj) => {
    // 使用react-notifications-component
    Store.addNotification({
        title: '',
        message: obj.message,
        type: obj.level || 'info',
        insert: 'top',
        container: 'top-center',
        animationIn: ['fadeIn'],
        animationOut: ['fadeOut'],
        dismiss: {
            duration: 2000,
            showIcon: true
        }
    });
};

export const handleError = (error, message) => {
    console.error(error);
    notify({ message: message || '操作失败', level: 'error' });
};

export const handleSuccess = (message) => {
    notify({ message: message || '操作成功', level: 'success' });
};

export const handleInfo = (message) => {
    notify({ message: message || '提示信息', level: 'info' });
};