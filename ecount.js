document.addEventListener('keydown', function (e) {
        if (e.key === 'F2') {
            const transmitBtn = document.getElementById('transmit');
            const sendSellBtn = document.getElementById('sendSell');

            if (transmitBtn) {
                transmitBtn.click();

            } else if (sendSellBtn) {
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

                if (allAddressSame && allCustomerSame) {
                    sendSellBtn.click();

                    // 첫 번째 주문자 값 사용
                    const valueToInsert = customers[0] || '';

                    // MutationObserver로 data-cid="cust" 감지 (최대 10초)
                    const observer = new MutationObserver((mutations, obs) => {
                        const custInput = document.querySelector('input[data-cid="cust"]');
                        if (custInput) {
                            custInput.value = valueToInsert;
                            obs.disconnect(); // 감지 중단
                        }
                    });
                    observer.observe(document.body, { childList: true, subtree: true });

                    // 5초 후 자동 중단
                    setTimeout(() => {
                        observer.disconnect();
                        console.warn('⏱️ 거래처 입력 대기 시간 초과');
                    }, 5000);
                }
                else {
                    const proceed = confirm('선택된 주소 또는 주문자가 2건 이상입니다. 진행하시겠습니까?');
                    if (proceed) {
                        sendSellBtn.click();
                    }
                }
            }
        }
    });
