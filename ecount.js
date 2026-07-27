// 키보드 이벤트 리스너 등록
document.addEventListener('keydown', function (e) {
    // F2 키가 눌렸을 때만 실행
    if (e.key === 'F2') {
        const transmitBtn = document.getElementById('transmit');   // ERP 전송 버튼
        const sendSellBtn = document.getElementById('sendSell');   // 판매 전송 버튼

        // ERP 전송 버튼이 있으면 클릭
        if (transmitBtn) {
            transmitBtn.click();
        } 
        // ERP 전송 버튼이 없고 판매 전송 버튼이 있을 경우
        else if (sendSellBtn) {
            // 체크된 행(tr)만 필터링
            let checkedRows = Array.from(document.querySelectorAll('tr'))
                .filter(tr => tr.querySelector('input[type="checkbox"][checked="checked"]'));

            // 주소 값 추출
            let addresses = checkedRows.map(tr => {
                const addressCell = tr.querySelector('td[data-label="주소"] span');
                return addressCell ? addressCell.textContent.trim() : null;
            });

            // 주문자 값 추출
            let customers = checkedRows.map(tr => {
                const customerCell = tr.querySelector('td[data-label="주문자"] span');
                return customerCell ? customerCell.textContent.trim() : null;
            });

            // 모든 주소가 동일한지 확인
            const allAddressSame = addresses.every(addr => addr === addresses[0]);
            // 모든 주문자가 동일한지 확인
            const allCustomerSame = customers.every(cust => cust === customers[0]);

            // ✅ 공통 실행 함수 정의
            function executeSendSell() {
                // 판매 전송 버튼 클릭
                sendSellBtn.click();

                // 첫 번째 주문자 값 사용
                const valueToInsert = customers[0] || '';
                if (!valueToInsert) {
                    console.warn('⚠️ 주문자 값이 비어있습니다.');
                }

                // MutationObserver로 거래처 입력칸(data-cid="cust") 감지
                const observer = new MutationObserver((mutations, obs) => {
                    const custInput = document.querySelector('input[data-cid="cust"]');
                    if (custInput) {
                        custInput.value = valueToInsert; // 주문자 값 입력
                        obs.disconnect(); // 감지 중단
                    }
                });
                observer.observe(document.body, { childList: true, subtree: true });

                // 5초 후 자동 중단 (타임아웃 처리)
                setTimeout(() => {
                    observer.disconnect();
                    console.warn('⏱️ 거래처 입력 대기 시간 초과');
                }, 5000);
            }

            // 주소와 주문자가 모두 동일할 경우 → 바로 실행
            if (allAddressSame && allCustomerSame) {
                executeSendSell();
            } 
            // 주소 또는 주문자가 다를 경우 → 확인창 띄우고, 확인 시 동일 로직 실행
            else {
                const proceed = confirm('선택된 주소 또는 주문자가 2건 이상입니다. 진행하시겠습니까?');
                if (proceed) {
                    executeSendSell(); // ✅ 동일 로직 실행
                }
            }
        }
    }
});
