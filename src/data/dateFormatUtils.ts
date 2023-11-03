export function dateFormat2Picker(format: string): string {
    if(!format){
        throw new Error(`format is null.`);
    }

    let picker = 'date'

    // 配置年 yyyy指年 YYYY指周年，年末年初的值可能有所变化
    if(format.indexOf('y') > -1 || format.indexOf('Y') > -1){
        picker = 'year'
    }

    // 配置月，M指月份，m指分钟
    if(format.indexOf("M") > -1){
        picker = 'month'
    }

    // 配置日，d指星期，D指月的天，DDD指年的天
    if(format.indexOf("d") > -1 || format.indexOf("D") > -1){
        picker = 'date'
    }

    // 配置小时，H指24小时制（0~23），k指24小时制（1~24），h指12小时制，m指分钟，s指秒，S指小数秒
    if(format.indexOf('H') > -1
        || format.indexOf('h') > -1
        || format.indexOf('k') > -1
        ||  format.indexOf('m') > -1
        ||  format.indexOf('s') > -1
        ||  format.indexOf('S') > -1
    ){
        picker = 'datetime'
    }

    return picker
}

// 日期格式转换标准格式
export function dateFormatStandard(format: string): string {
    if(!format){
        return undefined
    }

    if(format.indexOf('y') > -1){
        format = format.replace(new RegExp('y','g'),'Y')
    }

    if(format.indexOf('d') > -1){
        format = format.replace(new RegExp('d','g'),'D')
    }

    return format
}