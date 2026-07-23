document.addEventListener('keydown', function (e) {
        if (e.key === 'F2') {
            const transmitBtn = document.getElementById('transmit');
            const sendSellBtn = document.getElementById('sendSell');

            if (transmitBtn) {
                //ERP판매 팝업속 (확인)
                transmitBtn.click();
                
            } else if (sendSellBtn) {
                //ERP판매
                sendSellBtn.click();
            } else {
                console.error('❌ 전송 버튼과 ERP전송 버튼 모두 없음');
            }
        }
    });
