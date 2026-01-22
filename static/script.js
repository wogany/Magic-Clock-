/**
 * Magic-Clock 灯珠取模工具 - 前端逻辑脚本
 * 功能：处理灯珠生成、点击交互、撤销重做、数据保存与心跳检测
 */

document.addEventListener('DOMContentLoaded', () => {
    // 获取页面 DOM 元素引用
    const beadContainer = document.getElementById('bead-container');
    const countSpan = document.getElementById('count');
    const indexDisplayGrid = document.getElementById('index-display-grid');
    const helpModal = document.getElementById('help-modal');
    
    // 应用状态变量
    let selectedIndices = new Set(); // 使用 Set 存储已选中的全局索引，保证唯一性
    let history = [];                // 撤销栈
    let redoStack = [];              // 重做栈
    let showIndices = true;          // 是否显示灯珠上的索引数字

    /**
     * 初始化灯珠布局
     * 生成 6 个组（Group），每个组包含 15 个按蛇形排列的灯珠
     */
    function initLayout() {
        beadContainer.innerHTML = '';
        for (let g = 0; g < 6; g++) {
            // 创建组卡片
            const groupCard = document.createElement('div');
            groupCard.className = `group-card group-${g}`;
            
            // 组标题
            const title = document.createElement('div');
            title.className = 'group-title';
            title.textContent = `Group ${g}`;
            groupCard.appendChild(title);

            // 组内的灯珠网格
            const grid = document.createElement('div');
            grid.className = 'bead-grid';
            
            // 蛇形连线生成算法 (5行 x 3列)
            for (let r = 0; r < 5; r++) {
                for (let c = 0; c < 3; c++) {
                    const bead = document.createElement('div');
                    bead.className = 'bead';
                    
                    // 计算组内局部索引 (0-14)
                    let localIndex;
                    if (r % 2 === 0) {
                        // 偶数行：从右向左 (0, 1, 2)
                        localIndex = r * 3 + c;
                    } else {
                        // 奇数行：从左向右 (5, 4, 3)
                        localIndex = r * 3 + (2 - c);
                    }
                    
                    // 计算全局索引 (0-89)
                    const globalIndex = g * 15 + localIndex;
                    bead.dataset.index = globalIndex;
                    bead.textContent = localIndex; // 显示局部索引
                    bead.title = `Global Index: ${globalIndex}`;
                    
                    // 绑定点击事件
                    bead.addEventListener('click', () => toggleBead(globalIndex));
                    grid.appendChild(bead);
                }
            }
            groupCard.appendChild(grid);
            beadContainer.appendChild(groupCard);
        }
    }

    /**
     * 切换灯珠选中状态
     * @param {number} index - 要切换的灯珠全局索引
     * @param {boolean} updateHistory - 是否需要保存历史记录（撤销用）
     */
    function toggleBead(index, updateHistory = true) {
        if (updateHistory) {
            saveState(); // 操作前保存当前状态
        }

        if (selectedIndices.has(index)) {
            selectedIndices.delete(index);
        } else {
            selectedIndices.add(index);
        }
        
        updateUI();
    }

    /**
     * 更新页面视觉显示
     * 包括灯珠颜色、统计数字、侧边栏索引列表等
     */
    function updateUI() {
        // 1. 更新灯珠的选中样式
        document.querySelectorAll('.bead').forEach(bead => {
            const idx = parseInt(bead.dataset.index);
            if (selectedIndices.has(idx)) {
                bead.classList.add('selected');
            } else {
                bead.classList.remove('selected');
            }

            // 控制索引文字显示/隐藏
            if (showIndices) {
                bead.classList.remove('hide-index');
            } else {
                bead.classList.add('hide-index');
            }
        });

        // 2. 按组对选中的索引进行分类
        const groupIndices = Array.from({ length: 6 }, () => []);
        selectedIndices.forEach(idx => {
            const g = Math.floor(idx / 15);
            const localIdx = idx % 15;
            groupIndices[g].push(localIdx);
        });

        // 3. 更新统计数字
        countSpan.textContent = selectedIndices.size;
        
        // 4. 更新侧边栏的数据展示区域
        indexDisplayGrid.innerHTML = '';
        groupIndices.forEach((indices, g) => {
            // 组内排序
            indices.sort((a, b) => a - b);
            
            const box = document.createElement('div');
            box.className = `index-group-box index-group-${g}`;
            const arrayText = `[${indices.join(', ')}]`;
            
            box.innerHTML = `
                <h4>GROUP ${g} (点击复制)</h4>
                <div class="array-content">${arrayText}</div>
            `;
            
            // 点击卡片自动复制到剪贴板
            box.onclick = () => copyToClipboard(arrayText, box);
            indexDisplayGrid.appendChild(box);
        });
    }

    /**
     * 状态保存 (用于撤销/重做)
     */
    function saveState() {
        history.push(new Set(selectedIndices));
        redoStack = []; // 产生新操作时，清空重做栈
        if (history.length > 50) history.shift(); // 最多保存 50 步
    }

    function undo() {
        if (history.length > 0) {
            redoStack.push(new Set(selectedIndices));
            selectedIndices = history.pop();
            updateUI();
        }
    }

    function redo() {
        if (redoStack.length > 0) {
            history.push(new Set(selectedIndices));
            selectedIndices = redoStack.pop();
            updateUI();
        }
    }

    /**
     * 清空所有已选灯珠
     */
    function clearAll() {
        if (selectedIndices.size === 0) return;
        saveState();
        selectedIndices.clear();
        updateUI();
    }

    /**
     * 切换索引数字的可见性
     */
    function toggleIndexVisibility() {
        showIndices = !showIndices;
        updateUI();
    }

    /**
     * 复制文本到剪贴板并显示成功反馈
     */
    async function copyToClipboard(text, element) {
        try {
            await navigator.clipboard.writeText(text);
            const h4 = element.querySelector('h4');
            const originalText = h4.textContent;
            h4.textContent = '已复制到剪贴板！';
            h4.style.color = 'var(--primary)';
            
            setTimeout(() => {
                h4.textContent = originalText;
                h4.style.color = '';
            }, 1000);
        } catch (err) {
            console.error('复制失败: ', err);
        }
    }

    /**
     * 与后端 API 交互：保存当前配置到服务器
     */
    async function saveConfig() {
        try {
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selected_indices: Array.from(selectedIndices) })
            });
            const data = await response.json();
            alert(data.message);
        } catch (err) {
            alert('保存失败: ' + err);
        }
    }

    /**
     * 与后端 API 交互：从服务器加载上次保存的配置
     */
    async function loadConfig() {
        try {
            const response = await fetch('/api/config');
            const data = await response.json();
            saveState();
            selectedIndices = new Set(data.selected_indices);
            updateUI();
            alert('配置加载成功');
        } catch (err) {
            alert('加载失败: ' + err);
        }
    }

    // 绑定按钮点击事件
    document.getElementById('btn-undo').onclick = undo;
    document.getElementById('btn-redo').onclick = redo;
    document.getElementById('btn-clear').onclick = clearAll;
    document.getElementById('btn-toggle-index').onclick = toggleIndexVisibility;
    document.getElementById('btn-save').onclick = saveConfig;
    document.getElementById('btn-load').onclick = loadConfig;
    
    // 帮助弹窗控制逻辑
    document.getElementById('btn-help').onclick = () => { helpModal.style.display = 'flex'; };
    document.querySelector('.close-btn').onclick = () => { helpModal.style.display = 'none'; };
    window.onclick = (event) => { if (event.target == helpModal) helpModal.style.display = 'none'; };

    // 键盘快捷键支持
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            undo();
        } else if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            redo();
        }
    });

    // 页面初始化执行
    initLayout();
    updateUI();

    /**
     * 心跳检测逻辑
     * 每 3 秒向服务器发送一次请求，告诉后端“我还在运行”。
     * 如果后端 10 秒没收到心跳，会自动关闭服务程序。
     */
    setInterval(() => {
        fetch('/api/heartbeat', { method: 'POST' }).catch(() => {});
    }, 3000);
});
