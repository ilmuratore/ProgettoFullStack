const ExcelJS = require('exceljs');

const formatDateOnly = (value) => {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const formatDateTime = (value) => {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return `${formatDateOnly(date)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const createWorkbook = (creator) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = creator;
    workbook.created = new Date();
    return workbook;
};

const styleHeaderRow = (worksheet) => {
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0F766E' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
};

const autosizeColumns = (worksheet) => {
    worksheet.columns.forEach((column) => {
        let maxLength = 10;
        column.eachCell({ includeEmpty: true }, (cell) => {
            const value = cell.value == null ? '' : String(cell.value);
            maxLength = Math.max(maxLength, value.length + 2);
        });
        column.width = Math.min(maxLength, 40);
    });
};

const getTodayFileStamp = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const workbookToBuffer = async (workbook) => {
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
};

module.exports = {
    createWorkbook,
    styleHeaderRow,
    autosizeColumns,
    formatDateOnly,
    formatDateTime,
    getTodayFileStamp,
    workbookToBuffer
};
