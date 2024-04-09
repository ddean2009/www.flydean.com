import React, { useEffect } from 'react';
const LoadScript: React.FC<{ url: string }> = ({ url }) => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;

        document.body.appendChild(script);

        // 清理函数，组件卸载时移除脚本
        return () => {
            document.body.removeChild(script);
        };
    }, [url]);

    return null;
};

export default LoadScript;
