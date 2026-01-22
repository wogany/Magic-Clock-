from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List
import os
import time

"""
Magic-Mini 灯珠索引取模工具 - 后端服务
功能：提供灯珠配置的保存、读取，以及服务的自动管理（心跳检测与自动开启浏览器）
"""

# 初始化 FastAPI 应用
# FastAPI 是一个现代、快速（高性能）的 Python Web 框架，用于构建 API
app = FastAPI(title="Magic-Mini 灯珠索引取模工具")

# 全局变量：记录最后一次心跳的时间戳
# 心跳机制用于检测前端页面是否仍然开启
lastHeartbeat = time.time()

@app.post("/api/heartbeat")
async def heartbeat():
    """
    接收前端发送的心跳请求
    每当页面处于开启状态时，前端会定期调用此接口更新 lastHeartbeat 时间
    """
    global lastHeartbeat
    lastHeartbeat = time.time()
    return {"status": "ok"}

class BeadConfig(BaseModel):
    """
    灯珠配置数据模型
    定义了保存数据时需要的格式：一个包含整数索引的列表
    """
    selected_indices: List[int]

# 模拟数据库：在内存中存储当前的灯珠选择状态
currentConfig = {"selected_indices": []}

@app.get("/api/config")
async def getConfig():
    """
    获取当前的灯珠配置
    返回内存中存储的所有已选灯珠索引
    """
    return currentConfig

@app.post("/api/save")
async def saveConfig(config: BeadConfig):
    """
    保存新的灯珠配置
    将前端传来的索引列表存入内存
    """
    currentConfig["selected_indices"] = config.selected_indices
    return {"status": "success", "message": "配置已保存"}

# 挂载静态文件目录
# 将 static 文件夹映射到根路径 /，这样浏览器访问时会自动加载 index.html
app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    import webbrowser
    import threading

    def openBrowser():
        """
        自动打开浏览器函数
        等待服务器启动 2 秒后，自动在默认浏览器中打开工具页面
        """
        print("正在等待服务启动以打开浏览器...")
        time.sleep(2)
        url = "http://127.0.0.1:8000"
        print(f"正在尝试打开浏览器: {url}")
        webbrowser.open(url)

    def monitorHeartbeat():
        """
        心跳监控守护线程
        逻辑：如果超过 10 秒没有收到前端的心跳，认为浏览器已关闭，随即停止整个后端服务
        """
        # 给予启动宽限时间，前 20 秒不执行强制关闭检查
        time.sleep(20)
        while True:
            # 如果当前时间与最后心跳时间差超过 10 秒
            if time.time() - lastHeartbeat > 10:
                print("检测到浏览器已关闭，正在停止服务...")
                # 强制退出进程
                os._exit(0)
            # 每 2 秒检查一次
            time.sleep(2)

    # 使用线程 (threading) 同时执行多个任务而不会互相阻塞
    # 启动自动打开浏览器线程
    threading.Thread(target=openBrowser, daemon=True).start()
    # 启动心跳监控线程
    threading.Thread(target=monitorHeartbeat, daemon=True).start()
    
    # 启动 Web 服务器 (uvicorn)
    # host="127.0.0.1" 表示仅限本地访问，port=8000 是服务端口
    print("正在启动 FastAPI 服务...")
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
