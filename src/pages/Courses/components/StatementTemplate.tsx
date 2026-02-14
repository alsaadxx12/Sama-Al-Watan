import { PrintSettings } from '../../../hooks/usePrintSettings';

interface StatementData {
    studentName: string;
    courseName: string;
    totalFee: number;
    currency: string;
    vouchers: {
        number: string;
        date: any;
        amount: number;
        details?: string;
        notes?: string;
    }[];
}

export async function generateStatementHTML(
    data: StatementData,
    settings: PrintSettings
): Promise<string> {
    const {
        primaryColor = '#4A0E6B',
        logoUrl = "",
        companyNameLabel = '',
        footerAddress = '',
    } = settings;

    const totalPaid = data.vouchers.reduce((sum, v) => sum + v.amount, 0);
    const balance = Math.max(0, data.totalFee - totalPaid);
    const currencySymbol = data.currency === 'USD' ? '$' : 'IQD';

    const formatDate = (date: any) => {
        if (!date) return '—';
        try {
            const d = date?.toDate?.() || (date?.seconds ? new Date(date.seconds * 1000) : new Date(date));
            if (isNaN(d.getTime())) return '—';
            return d.toLocaleDateString('ar-EG');
        } catch (e) {
            return '—';
        }
    };

    return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <title>كشف حساب - ${data.studentName}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');
            
            body {
                font-family: 'Tajawal', sans-serif;
                margin: 0;
                padding: 40px;
                background-color: #fff;
                color: #333;
            }
            
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 2px solid ${primaryColor};
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            
            .company-info h1 {
                margin: 0;
                color: ${primaryColor};
                font-size: 24px;
            }
            
            .logo {
                height: 80px;
            }
            
            .title {
                text-align: center;
                margin-bottom: 40px;
            }
            
            .title h2 {
                background-color: ${primaryColor};
                color: white;
                display: inline-block;
                padding: 10px 40px;
                border-radius: 50px;
                margin: 0;
            }
            
            .details-grid {
                display: grid;
                grid-template-cols: 1fr 1fr;
                gap: 20px;
                margin-bottom: 40px;
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 15px;
            }
            
            .detail-item {
                font-weight: 700;
            }
            
            .detail-item span {
                font-weight: 900;
                color: ${primaryColor};
            }
            
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 40px;
            }
            
            th {
                background-color: #f1f3f5;
                padding: 12px;
                border: 1px solid #dee2e6;
                font-weight: 900;
            }
            
            td {
                padding: 12px;
                border: 1px solid #dee2e6;
                text-align: center;
                font-weight: 700;
            }
            
            .total-row {
                background-color: #f8f9fa;
                font-weight: 900;
            }
            
            .balance-row {
                background-color: #fff0f0;
                color: #e03131;
                font-weight: 900;
            }
            
            .footer {
                margin-top: 60px;
                text-align: center;
                border-top: 1px solid #dee2e6;
                padding-top: 20px;
                font-size: 12px;
                color: #666;
            }
            
            @media print {
                body { padding: 20px; }
                .footer { position: fixed; bottom: 20px; width: 100%; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-info">
                <h1>${companyNameLabel}</h1>
            </div>
            ${logoUrl ? `<img src="${logoUrl}" class="logo" />` : ''}
        </div>
        
        <div class="title">
            <h2>كشف حساب طالب</h2>
        </div>
        
        <div class="details-grid">
            <div class="detail-item">اسم الطالب: <span>${data.studentName}</span></div>
            <div class="detail-item">اسم الدورة: <span>${data.courseName}</span></div>
            <div class="detail-item">أجور القيد: <span>${data.totalFee.toLocaleString()} ${currencySymbol}</span></div>
            <div class="detail-item">تاريخ الكشف: <span>${new Date().toLocaleDateString('ar-EG')}</span></div>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>ت</th>
                    <th>رقم الوصل</th>
                    <th>التاريخ</th>
                    <th>المبلغ المدفوع</th>
                    <th>التفاصيل</th>
                </tr>
            </thead>
            <tbody>
                ${data.vouchers.map((v, i) => `
                    <tr>
                        <td>${i + 1}</td>
                        <td style="color: ${primaryColor}">${v.number}</td>
                        <td>${formatDate(v.date)}</td>
                        <td>${v.amount.toLocaleString()} ${currencySymbol}</td>
                        <td>${v.details || v.notes || '—'}</td>
                    </tr>
                `).join('')}
                <tr class="total-row">
                    <td colspan="3">إجمالي المدفوع</td>
                    <td>${totalPaid.toLocaleString()} ${currencySymbol}</td>
                    <td></td>
                </tr>
                <tr class="balance-row">
                    <td colspan="3">المبلغ المتبقي</td>
                    <td>${balance.toLocaleString()} ${currencySymbol}</td>
                    <td></td>
                </tr>
            </tbody>
        </table>
        
        <div style="display: flex; justify-content: space-between; margin-top: 50px;">
            <div style="text-align: center;">
                <p>توقيع المحاسب</p>
                <div style="width: 150px; border-bottom: 1px dashed #000; margin-top: 40px;"></div>
            </div>
            <div style="text-align: center;">
                <p>ختم المركز</p>
                <div style="width: 150px; border-bottom: 1px dashed #000; margin-top: 40px;"></div>
            </div>
        </div>
        
        <div class="footer">
            ${footerAddress}
        </div>
    </body>
    </html>
    `;
}
