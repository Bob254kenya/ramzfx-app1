import { useTranslations } from '@deriv-com/translations';
import { Tooltip } from '@deriv-com/ui';

// Custom WhatsApp Icon - using your uploaded image
const CustomWhatsAppIcon = () => (
    <img
        src="/whatsapp icon.png"
        alt="WhatsApp"
        width="16"
        height="16"
        style={{ objectFit: 'contain' }}
    />
);

const WhatsApp = () => {
    const { localize } = useTranslations();

    // Fixed WhatsApp group link
    const getWhatsAppLink = () => {
        return 'https://chat.whatsapp.com/GJXCqUGcrG1DFHEBnb3tpN';
    };

    return (
        <Tooltip
            as='a'
            className='app-footer__icon'
            href={getWhatsAppLink()}
            target='_blank'
            tooltipContent={localize('WhatsApp')}
        >
            <CustomWhatsAppIcon />
        </Tooltip>
    );
};

export default WhatsApp;