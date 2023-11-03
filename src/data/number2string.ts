import { comma } from 'number-magic'

export function number2string(num: number | null | undefined, thousandsSeparatorValue: boolean, precisionValue: number, percentageValue: boolean): string {
    if (num === null || num === undefined) {
        return ''
    } else if (typeof num === 'number' || typeof num === 'string') {
        let result = String(num)

        // 基础：先实现精度化
        if (precisionValue >= 0) {
            result = round(num, precisionValue)
        }

        // 百分比优先级高于千分位，先实现百分比，再实现千分位
        if (percentageValue) {
            if (thousandsSeparatorValue) {// 千分位
                result = comma(result)
            }

            result += '%'
        } else if (thousandsSeparatorValue) {// 千分位
            // 小数精度优先级最高
            result = comma(result)
        }

        return result
    } else {
        throw new Error(`num [${num}]:[${typeof num}] is neither a number nor null.`)
    }
}

// 处理数字数据和展示结果保持一致
export function number2standard(num: number | null | undefined, precisionValue: number): number {
    if (typeof num === 'number' && precisionValue >= 0) {
        return Number(round(num, precisionValue))
    }

    return num
}

export function round(value, how){
    const num = Number( value );
    let tempNum = null, result = null;
    if(num < 0){
        tempNum = -num;
        result = roundWithNum(tempNum,how);
        result = '-' + result;

    }else {
        result = roundWithNum(num,how);
    }
    return result;

}

const roundWithNum = function(value, len): string {
    let num = value
    num = num.toFixed(10)

    let result = parseFloat(num)

    const numPow = Math.pow(10, len)
    //乘法
    const numAccMul = numberAccMul(result, numPow)
    //四舍五入取整
    result = Math.round(numAccMul)
    //保留len位小数
    result = result / Math.pow(10, len)

    const resultStr = result.toString().split('.')
    if(resultStr.length == 1){ // 只有整数部分
        if(len > 0){ // 精度设置大于0，处理后拼接
            resultStr[1] = ''
            for(let i=0;i<len;i++){
                resultStr[1] += '0';
            }

            return resultStr.join('.')
        }
        return result.toString()
    } else if(resultStr.length == 2){ // 整数+小数部分
        if (resultStr[1].length == len) { // 实际精度已经达标，直接返回
            return result.toString()
        }
        const addLength = len - resultStr[1].length // 按位补零
        for (let i = 0; i < addLength; i++) {
            resultStr[1] += '0'
        }

        return resultStr.join('.')
    }

    return result.toString()
}

/**
 * 乘法函数，继承自sef
 */
export function numberAccMul(num: number, how: number) {
    let m = 0;
    const s1 = num.toString(), s2 = how.toString()
    try {
        const s1Str = s1.split('.')
        if(s1Str.length > 1){
            m += s1Str[1].length
        }
    } catch (e) {
        console.error(e)
    }
    try {
        const s2Str = s2.split('.')
        if(s2Str.length > 1){
            m += s2Str[1].length
        }
    } catch (e) {
        console.error(e)
    }
    return Number(s1.replace('.', '')) * Number(s2.replace('.', '')) / Math.pow(10, m)
}

// 将百分比的数值。。除100变成小数 （直接除有精度问题）
export function numberAccPercentage(num) {
    const value = num.toString()
    if (value == '') {
        return value
    }

    const valueStr = value.split('.')
    let zs = valueStr[0] ? valueStr[0] : ''
    const xs = valueStr[1] ? valueStr[1] : ''

    let isFs = false
    if (zs.indexOf('-') == 0) {
        isFs = true
        zs = zs.substring(1)
    }

    let result
    if (zs.length == 1) {
        result = '0.0' + zs + xs
    } else if (zs.length == 2) {
        result = '0.' + zs + xs
    } else {
        const zsStr = String(zs)
        const zsIndex = zsStr.length - 2
        const zsResult = zsStr.substring(0, zsIndex)
        const zsLeft = zsStr.substring(zsIndex)
        result = zsResult + '.' + zsLeft + xs
    }

    if (isFs) {
        return Number('-' + result)
    } else {
        return Number(result)
    }
}
