# UI重构架构设计

## 视觉风格 (Visual Identity)
- **配色方案 (Color Palette)**:
  - 背景色: `#0f172a` (深蓝黑)
  - 卡片背景: `#1e293b` (深蓝灰)
  - 主色 (Primary): `#22d3ee` (青色)
  - 次色 (Secondary): `#818cf8` (靛蓝)
  - 强调色 (Accent): `#f472b6` (粉红)
  - 边框色: `#334155`
  - 文字主色: `#f8fafc`
  - 文字次色: `#94a3b8`
- **字体**:
  - UI: `Inter`, `system-ui`
  - 代码/数字: `JetBrains Mono`

## 布局设计 (Layout Design)
1. **Header (顶部栏)**:
   - 左侧: 软件 Logo 和名称。
   - 右侧: 全局操作按钮 (保存、加载、帮助)。
2. **Main Layout (主体布局)**:
   - **左侧工作区 (Workspace)**: 占 70% 宽度，居中显示 6 组灯珠卡片。
   - **右侧侧边栏 (Sidebar)**: 占 30% 宽度，固定在右侧。
     - 顶部: 统计信息 (选中数量)。
     - 中部: 实时生成的 6 组索引数组代码块。
     - 底部: 快速操作按钮 (清空、撤销、重做、切换索引)。

## 组件定义 (Component Definition)
- **Bead (灯珠)**:
  - 默认状态: 灰色半透明圆圈。
  - 选中状态: 青色发光效果 (`box-shadow: 0 0 10px #22d3ee`)。
  - 悬停状态: 边框高亮。
- **Group Card (组卡片)**:
  - 玻璃拟态效果 (Glassmorphism)，轻微背景模糊。
- **Code Block (代码块)**:
  - 深色背景，等宽字体，支持一键复制。

## 技术选型
- HTML5 / CSS3 (Flexbox & Grid).
- 原生 JavaScript (ES6+).
- Lucide Icons (可选，或使用简单的 SVG 图标)。
