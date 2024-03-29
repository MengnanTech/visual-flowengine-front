import {config} from "@/components/d3Helpers/treeHelpers.ts";

const MovingArrowPattern = () => (
    <pattern id="movingArrowPattern" width="50" height="10" patternUnits="userSpaceOnUse">
        {/* 背景色，采用渐变色填充以增强视觉效果 */}
        <rect width="50" height="10" fill="url(#gradientBackground)"/>
        {/* 渐变色定义 */}
        <linearGradient id="gradientBackground" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{stopColor: config.link1, stopOpacity: 1}}/>
            <stop offset="100%" style={{stopColor: config.link2, stopOpacity: 1}}/>
        </linearGradient>
        {/* 箭头图形，更加流畅的设计 */}
        <path d="M0,49C125,0,125,200,250,200" stroke='#d0e4eb' strokeWidth="2" fill="none"/>
        {/* 动画效果，使箭头沿直线移动 */}
        <animateTransform
            attributeName="patternTransform"
            type="translate"
            from="-50,0"
            to="0,0"
            dur="5s"
            repeatCount="indefinite"
        />
    </pattern>
);

export default MovingArrowPattern;
