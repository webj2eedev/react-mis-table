import moment from 'moment'
import { number2standard } from './number2string'

/**
 * moment -> Date
 */
export function normalizeOutputCell(cellData: unknown,column: Record<string, any>): any {
    const { type: colType, head } = column

    if (colType === 'NumberColumn') {
        if (cellData == null || cellData == undefined) {
            return null
        }
        if (typeof cellData !== 'number') {
            return null
        }

        let num = cellData
        let precisionValue = column.precision
        if(column.percentage){
            num = cellData / 100
            if(precisionValue >= 0){
                precisionValue = column.precision + 2
            }
        }

        const newData = Number(number2standard(num, precisionValue))
        if (isNaN(cellData)) {
            throw new Error(`NEditTableData设置值的列${head}列为NumberColumn类型,value[${cellData}]不能转换为number类型,请检查！`)
        }
        return newData
    } else if (colType === 'DateColumn') {
        if (moment.isMoment(cellData)) {
            return cellData.toDate()
        }
    }

    return cellData
}

export function normalizeOutputRow(rowData: Record<string, unknown>, columns: Array<Record<string, any>>): Record<string, unknown> {
    const newRowData = {}
    for (let i = 0; i < columns.length; i++) {
        const tempColumn = columns[i]
        const { name } = tempColumn
        const resultData = normalizeOutputCell(rowData[name], tempColumn)
        newRowData[name] = resultData
    }
    return newRowData
}

export function normalizeOutputTable(tableData: Array<Record<string, unknown>>, columns: Array<Record<string, any>>): Array<Record<string, unknown>> {
    return tableData.map((rowData) => normalizeOutputRow(rowData, columns))
}
