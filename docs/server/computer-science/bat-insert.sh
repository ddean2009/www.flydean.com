#!/bin/bash

# 初始化计数器
count=0

# 列出当前目录下的所有 .md 文件
for file in *.md; do
    # 如果文件存在
    if [ -f "$file" ]; then
        # 计数器加1
        count=$((count+1))
        # 构造要添加的文本
        text="# $count. "
        # 使用 sed 命令在文件的第一行前添加文本
        gsed -i "1s|^|$text|" "$file"
    fi
done

echo "Finished adding numbering to .md files."
