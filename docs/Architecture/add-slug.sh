#!/bin/bash

# 使用find命令递归查找所有.md文件
find . -type f -name "*.md" | while read -r file; do
    # 获取文件所在的目录和带后缀的文件名
    dir=$(dirname -- "$file")
    filename_with_ext=$(basename -- "$file")

    # 去除文件名开头的数字和短横线，并获取不带后缀的文件名
#    filename=$(echo "$filename_with_ext" | sed -E 's/^[0-9-]+//')
    filename=$(echo "$filename_with_ext" )
    filename="${filename%.md}"  # 去除.md后缀

    # 构造要插入的三行代码
    header="---
slug: /${filename}
---
"
echo "$header";

    # 将这三行代码插入到文件的开头
    {
        echo "$header";
        cat "$file";
    } > "${file}.tmp" && mv "${file}.tmp" "$file"

    echo "已更新文件: $file"
done

echo "所有.md文件已更新完成。"
