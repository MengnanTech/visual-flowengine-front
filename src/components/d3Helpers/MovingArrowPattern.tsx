const MovingArrowPattern = () => (
    <pattern id="movingArrowPattern" width="50" height="10" patternUnits="userSpaceOnUse">
            {/* 背景色，采用渐变色填充以增强视觉效果 */}
            <rect width="50" height="10" fill="url(#gradientBackground)"/>
            {/* 渐变色定义 */}
            <linearGradient id="gradientBackground" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor: '#d0e4eb', stopOpacity: 1}}/>
                <stop offset="100%" style={{stopColor: '#bde1ee', stopOpacity: 1}}/>
            </linearGradient>
            {/* 箭头图形，更加流畅的设计 */}
        <path d="M 0,5 L 12,5 L 9,2 M 12,5 L 9,8" stroke='#d0e4eb' strokeWidth="2" fill="none"/>
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
