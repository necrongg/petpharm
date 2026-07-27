    document.addEventListener('keydown', function (e) {
        if (e.key === 'F2') {
            const transmitBtn = document.getElementById('transmit');
            const sendSellBtn = document.getElementById('sendSell');

            if (transmitBtn) {
                // ERP판매 팝업속 (확인)
                transmitBtn.click();

            } else if (sendSellBtn) {
                // ERP판매
                let checkedRows = Array.from(document.querySelectorAll('tr'))
                    .filter(tr => tr.querySelector('input[type="checkbox"][checked="checked"]'));

                let addresses = checkedRows.map(tr => {
                    const addressCell = tr.querySelector('td[data-label="주소"] span');
                    return addressCell ? addressCell.textContent.trim() : null;
                });

                let customers = checkedRows.map(tr => {
                    const customerCell = tr.querySelector('td[data-label="주문자"] span');
                    return customerCell ? customerCell.textContent.trim() : null;
                });

                const allAddressSame = addresses.every(addr => addr === addresses[0]);
                const allCustomerSame = customers.every(cust => cust === customers[0]);

                console.log('주소 목록:', addresses);
                console.log('주문자 목록:', customers);
                console.log('주소 모두 일치?', allAddressSame);
                console.log('주문자 모두 일치?', allCustomerSame);

                if (allAddressSame && allCustomerSame) {
                    sendSellBtn.click();
                } else {
                    const proceed = confirm('선택된 주소 또는 주문자가 2건 이상입니다. 진행하시겠습니까?');
                    if (proceed) {
                        sendSellBtn.click();
                    } else {
                        console.log('❌ 사용자가 취소했습니다.');
                    }
                }

                // 배열 초기화
                addresses = [];
                customers = [];
                checkedRows = [];
            } else {
                console.error('❌ 전송 버튼과 ERP전송 버튼 모두 없음');
            }
        }
    });
