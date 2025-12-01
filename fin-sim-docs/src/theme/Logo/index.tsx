import React from 'react';
import Logo from '@theme-original/Logo';
import type LogoType from '@theme/Logo';
import type { WrapperProps } from '@docusaurus/types';
import { useLocation } from '@docusaurus/router';

type Props = WrapperProps<typeof LogoType>;

export default function LogoWrapper(props: Props): JSX.Element {
    const location = useLocation();

    // Only intercept clicks when we're in the docs
    const handleLogoClick = (e: React.MouseEvent) => {
        // Prevent default Docusaurus routing
        e.preventDefault();
        e.stopPropagation();

        // Force a full page navigation to the main app
        window.location.href = '/finsim-pro/';
    };

    return (
        <div onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <Logo {...props} />
        </div>
    );
}
