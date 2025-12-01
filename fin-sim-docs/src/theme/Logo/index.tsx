import React from 'react';
import Logo from '@theme-original/Logo';
import type LogoType from '@theme/Logo';
import type { WrapperProps } from '@docusaurus/types';

type Props = WrapperProps<typeof LogoType>;

export default function LogoWrapper(props: Props): JSX.Element {
    // Intercept clicks to force opening in the named window
    const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // We only want to intercept if it's a left click and not modified (ctrl/cmd/shift)
        if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
            return;
        }

        // Prevent default navigation
        e.preventDefault();
        e.stopPropagation();

        // Get the href from the logo config (which we set to the correct absolute URL)
        const href = props.href || '/finsim-pro/';

        // Open in the named window 'finsim-app'
        // If a window with this name exists, it will switch to it
        // If not, it will open a new tab with this name
        window.open(href, 'finsim-app');
    };

    return (
        <div onClickCapture={handleLogoClick as any} style={{ cursor: 'pointer' }}>
            <Logo {...props} />
        </div>
    );
}
