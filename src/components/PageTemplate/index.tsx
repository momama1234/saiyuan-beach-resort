import Logo from '@/components/Logo'
import MenuWrapper from '@/components/menu/MenuWrapper'

import Wrapper from './components/Wrapper'

interface PageTemplateProps {
    images: string[]
    mobileImages?: string[]
    children?: React.ReactNode
    footer?: React.ReactNode
    showCarouselControls?: boolean
    scrollable?: boolean
}

const PageTemplate = ({ images, mobileImages, children, footer, showCarouselControls = true, scrollable = true }: PageTemplateProps): React.JSX.Element => {
    return (
        <div id="page-template" className="md:relative md:h-screen md:overflow-hidden">
            <MenuWrapper />
            <Logo />
            <Wrapper images={images} mobileImages={mobileImages} footer={footer} showCarouselControls={showCarouselControls} scrollable={scrollable}>{children}</Wrapper>
        </div>
    )
}

export default PageTemplate
