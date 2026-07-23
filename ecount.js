document.addEventListener('keydown', function (e) {
        if (e.key === 'F2') {
            const transmitBtn = document.getElementById('transmit');
            const sendSellBtn = document.getElementById('sendSell');

            if (transmitBtn) {
                transmitBtn.click();
                console.log('▶️ 전송 버튼 클릭됨');
            } else if (sendSellBtn) {
                sendSellBtn.click();
                console.log('▶️ ERP전송(판매) 버튼 클릭됨');
            } else {
                console.error('❌ 전송 버튼과 ERP전송 버튼 모두 없음');
            }
        }
    });
