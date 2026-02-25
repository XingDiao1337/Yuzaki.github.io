// 主脚本文件

document.addEventListener('DOMContentLoaded', function() {
    // 初始化功能
    initMusicPlayer();
    initMouseGlow();
    initParticles();
    initScrollAnimations();
    initDetailSection();
});

// 音乐播放器
function initMusicPlayer() {
    const audio = document.getElementById('bgMusic');
    const musicPlayer = document.getElementById('musicPlayer');
    const playBtn = document.getElementById('playBtn');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const progressRing = document.getElementById('progressRing');
    const currentTimeEl = document.getElementById('currentTime');
    const totalTimeEl = document.getElementById('totalTime');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeIcon = document.getElementById('volumeIcon');
    
    let isPlaying = false;
    let previousVolume = 0.8;
    
    // 圆形进度条周长
    const circumference = 2 * Math.PI * 45;
    progressRing.style.strokeDasharray = circumference;
    progressRing.style.strokeDashoffset = circumference;
    
    // 格式化时间
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    // 更新进度条（圆形和线性）
    function updateProgress() {
        if (audio.duration) {
            const progress = audio.currentTime / audio.duration;
            const percentage = progress * 100;
            
            // 线性进度条
            progressFill.style.width = percentage + '%';
            
            // 圆形进度条
            const offset = circumference - (progress * circumference);
            progressRing.style.strokeDashoffset = offset;
            
            currentTimeEl.textContent = formatTime(audio.currentTime);
        }
    }
    
    // 更新音量图标
    function updateVolumeIcon(volume) {
        if (volume === 0) {
            volumeIcon.innerHTML = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
        } else if (volume < 0.5) {
            volumeIcon.innerHTML = '<path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>';
        } else {
            volumeIcon.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
        }
    }
    
    // 播放/暂停切换
    function togglePlay() {
        if (isPlaying) {
            audio.pause();
            playBtn.classList.remove('playing');
        } else {
            audio.play().catch(e => {
                console.log('自动播放被阻止，需要用户交互');
            });
            playBtn.classList.add('playing');
        }
        isPlaying = !isPlaying;
    }
    
    // 点击线性进度条跳转
    function seek(e) {
        const rect = progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = clickX / width;
        audio.currentTime = percentage * audio.duration;
    }
    
    // 点击圆形进度条跳转
    function seekCircle(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // 计算角度
        const angle = Math.atan2(mouseY - centerY, mouseX - centerX);
        let normalizedAngle = angle + Math.PI / 2; // 从顶部开始
        if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;
        
        // 转换为进度
        const progress = normalizedAngle / (2 * Math.PI);
        audio.currentTime = progress * audio.duration;
    }
    
    // 音量改变
    function changeVolume(e) {
        const volume = e.target.value / 100;
        audio.volume = volume;
        updateVolumeIcon(volume);
        if (volume > 0) previousVolume = volume;
    }
    
    // 点击音量图标静音/取消静音
    function toggleMute() {
        if (audio.volume > 0) {
            previousVolume = audio.volume;
            audio.volume = 0;
            volumeSlider.value = 0;
        } else {
            audio.volume = previousVolume;
            volumeSlider.value = previousVolume * 100;
        }
        updateVolumeIcon(audio.volume);
    }
    
    // 加载元数据后显示总时长
    audio.addEventListener('loadedmetadata', () => {
        totalTimeEl.textContent = formatTime(audio.duration);
    });
    
    // 时间更新
    audio.addEventListener('timeupdate', updateProgress);
    
    // 播放结束
    audio.addEventListener('ended', () => {
        isPlaying = false;
        playBtn.classList.remove('playing');
        progressFill.style.width = '0%';
        progressRing.style.strokeDashoffset = circumference;
        audio.currentTime = 0;
    });
    
    // 按钮点击
    playBtn.addEventListener('click', togglePlay);
    
    // 线性进度条点击
    progressBar.addEventListener('click', seek);
    
    // 圆形进度条点击
    const playerCircle = document.querySelector('.player-circle');
    playerCircle.addEventListener('click', (e) => {
        if (e.target === playBtn || playBtn.contains(e.target)) return;
        seekCircle(e);
    });
    
    // 音量控制
    volumeSlider.addEventListener('input', changeVolume);
    volumeIcon.addEventListener('click', toggleMute);
    
    // 设置初始音量
    audio.volume = 0.8;
    updateVolumeIcon(0.8);
    
    // 尝试自动播放
    audio.play().then(() => {
        isPlaying = true;
        playBtn.classList.add('playing');
    }).catch(() => {
        // 自动播放被阻止，等待用户交互
        isPlaying = false;
        playBtn.classList.remove('playing');
    });
}

// 鼠标跟随光晕效果
function initMouseGlow() {
    const glowElement = document.createElement('div');
    glowElement.className = 'mouse-glow';
    glowElement.style.cssText = `
        position: fixed;
        width: 300px;
        height: 300px;
        border-radius: 50%;
        background: radial-gradient(circle, 
            rgba(255, 107, 157, 0.15) 0%, 
            rgba(156, 39, 176, 0.1) 40%, 
            transparent 70%);
        pointer-events: none;
        z-index: 0;
        transform: translate(-50%, -50%);
        transition: opacity 0.3s ease;
        opacity: 0;
    `;
    document.body.appendChild(glowElement);

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        glowElement.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
        glowElement.style.opacity = '0';
    });

    // 平滑跟随
    function animateGlow() {
        glowX += (mouseX - glowX) * 0.1;
        glowY += (mouseY - glowY) * 0.1;
        
        glowElement.style.left = glowX + 'px';
        glowElement.style.top = glowY + 'px';
        
        requestAnimationFrame(animateGlow);
    }
    animateGlow();
}

// 滚动动画
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.skill-tag, .btn').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // 添加可见类样式
    const style = document.createElement('style');
    style.textContent = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // 延迟显示元素
    setTimeout(() => {
        document.querySelectorAll('.skill-tag, .btn').forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('visible');
            }, index * 100);
        });
    }, 500);
}

// 粒子效果
function initParticles() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 2;
    `;
    document.body.appendChild(canvas);
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const particles = [];
    const particleCount = 50;
    
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.color = this.getRandomColor();
        }
        
        getRandomColor() {
            const colors = [
                'rgba(255, 107, 157, ',
                'rgba(156, 39, 176, ',
                'rgba(124, 77, 255, ',
                'rgba(255, 107, 107, ',
                'rgba(255, 182, 193, '
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.opacity + ')';
            ctx.fill();
            
            // 发光效果
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color + '0.5)';
        }
    }
    
    // 创建粒子
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // 动画循环
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        // 绘制连接线
        particles.forEach((p1, i) => {
            particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255, 107, 157, ${0.1 * (1 - distance / 150)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            });
        });
        
        requestAnimationFrame(animate);
    }
    animate();
}

// 详细介绍区域
function initDetailSection() {
    const detailBtn = document.getElementById('detailBtn');
    const detailSection = document.getElementById('detailSection');
    const collapseBtn = document.getElementById('collapseBtn');
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    let isOpen = false;
    
    // 展开/收起切换
    function toggleDetail() {
        isOpen = !isOpen;
        
        if (isOpen) {
            detailSection.classList.add('active');
            detailBtn.classList.add('active');
            
            // 绘制曲线
            setTimeout(() => {
                drawCurve();
            }, 100);
            
            // 依次显示时间线项目
            timelineItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('visible');
                }, 200 + index * 150);
            });
            
            // 滚动到详情区域
            setTimeout(() => {
                detailSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
        } else {
            detailSection.classList.remove('active');
            detailBtn.classList.remove('active');
            
            // 重置时间线项目
            timelineItems.forEach(item => {
                item.classList.remove('visible');
            });
            
            // 滚动回主卡片
            setTimeout(() => {
                document.querySelector('.card').scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }
    
    // 点击"了解更多"按钮
    detailBtn.addEventListener('click', toggleDetail);
    
    // 点击"收起"按钮
    collapseBtn.addEventListener('click', () => {
        isOpen = false;
        detailSection.classList.remove('active');
        detailBtn.classList.remove('active');
        
        // 重置时间线项目
        timelineItems.forEach(item => {
            item.classList.remove('visible');
        });
        
        // 滚动回主卡片
        setTimeout(() => {
            document.querySelector('.card').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    });
}

// 绘制连接曲线
function drawCurve() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    const curvePath = document.getElementById('curvePath');
    const svg = document.querySelector('.timeline-curve');
    
    if (!timelineItems.length || !curvePath || !svg) return;
    
    // 计算容器位置
    const container = document.querySelector('.timeline');
    const containerRect = container.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    
    // 收集所有时间线点的位置
    const points = [];
    timelineItems.forEach((item, index) => {
        const dot = item.querySelector('.timeline-dot');
        if (dot) {
            const rect = dot.getBoundingClientRect();
            const relativeX = 2; // 中心线位置
            const relativeY = rect.top - svgRect.top + rect.height / 2;
            points.push({ x: relativeX, y: relativeY });
        }
    });
    
    if (points.length < 2) return;
    
    // 设置 SVG 高度
    const totalHeight = points[points.length - 1].y + 50;
    svg.style.height = totalHeight + 'px';
    svg.setAttribute('height', totalHeight);
    
    // 生成贝塞尔曲线路径
    let pathD = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];
        const midY = (current.y + next.y) / 2;
        
        // 使用贝塞尔曲线创建平滑连接
        pathD += ` Q ${current.x} ${midY}, ${next.x} ${next.y}`;
    }
    
    // 添加曲线绘制动画
    curvePath.setAttribute('d', pathD);
    curvePath.style.strokeDasharray = curvePath.getTotalLength();
    curvePath.style.strokeDashoffset = curvePath.getTotalLength();
    
    // 触发动画
    requestAnimationFrame(() => {
        curvePath.style.transition = 'stroke-dashoffset 2s ease';
        curvePath.style.strokeDashoffset = '0';
    });
}

// 按钮点击涟漪效果
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 50%;
            transform: scale(0);
            animation: rippleEffect 0.6s ease-out;
            pointer-events: none;
        `;
        
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// 添加涟漪动画样式
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes rippleEffect {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// 页面加载完成后的动画
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // 延迟显示各元素
    const elements = [
        { selector: '.avatar-wrapper', delay: 0 },
        { selector: '.name', delay: 150 },
        { selector: '.alias', delay: 300 },
        { selector: '.skills', delay: 450 },
        { selector: '.description', delay: 600 },
        { selector: '.buttons', delay: 750 },
        { selector: '.detail-btn-wrapper', delay: 900 }
    ];
    
    elements.forEach(({ selector, delay }) => {
        const el = document.querySelector(selector);
        if (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(15px)';
            
            setTimeout(() => {
                el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, delay);
        }
    });
});

// 窗口大小改变时重新绘制曲线
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const detailSection = document.getElementById('detailSection');
        if (detailSection && detailSection.classList.contains('active')) {
            drawCurve();
        }
    }, 250);
});

// 控制台输出
console.log('%c✨ Yuzaki\'s Profile ✨', 
    'background: linear-gradient(135deg, #FF6B9D, #9C27B0); color: white; padding: 10px 20px; border-radius: 5px; font-size: 16px; font-weight: bold;');
console.log('%c欢迎来到我的个人主页！', 'color: #FF6B9D; font-size: 14px;');
console.log('%c点击"了解更多"查看我的编程之旅 🚀', 'color: #9C27B0; font-size: 14px;');
