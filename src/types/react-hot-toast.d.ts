declare module 'react-hot-toast' {
  export type Toast = {
    id: string;
    // Thêm các thuộc tính cần thiết khác nếu cần
  };

  export type ToasterProps = {
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    toastOptions?: any;
    reverseOrder?: boolean;
    gutter?: number;
    containerStyle?: React.CSSProperties;
    containerClassName?: string;
    children?: (props: any) => JSX.Element;
  };

  export const toast: {
    (message: string, options?: any): string;
    success: (message: string, options?: any) => string;
    error: (message: string, options?: any) => string;
    loading: (message: string, options?: any) => string;
    dismiss: (toastId?: string) => void;
    // Thêm các phương thức khác nếu cần
  };

  export const Toaster: React.FC<ToasterProps>;
} 