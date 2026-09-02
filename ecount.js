// 키보드 이벤트 리스너 등록
    document.addEventListener('keydown', function (e) {
        // F2 키가 눌렸을 때만 실행
        if (e.key === 'F2') {
            const sendSellBtn = document.getElementById('sendSell');// ERP전송(판매) 버튼
            const transmitBtn = document.getElementById('transmit');// 전송 버튼

            // 전송 버튼이 있으면 클릭
            if (transmitBtn) {
                transmitBtn.click();
            }
            // ERP전송(판매) 버튼이 있을 경우
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

                // 품목명 값 추출
                let items = checkedRows.map(tr => {
                    const customerCell = tr.querySelector('td[data-label="품목명(ERP_ECOUNT)"] span');
                    return customerCell ? customerCell.textContent.trim() : null;
                });

                console.log("✅ addresses:", addresses);
                console.log("✅ customers:", customers);
                console.log("✅ items:", items,items.length);


                // 주소 동일성 체크 (첫 번째 null은 무시) / 전체 선택시 첫 번째 열값 null
                let allAddressSame = true;
                if (addresses[0] === null) {
                    // 두 번째 요소부터 기준 잡기
                    const baseAddr = addresses[1];
                    allAddressSame = addresses.slice(1).every(addr => addr === baseAddr);
                } else {
                    // 첫 번째 값 기준으로 비교
                    allAddressSame = addresses.every(addr => addr === addresses[0]);
                }

                // 주문자 동일성 체크 (첫 번째 null은 무시) / 전체 선택시 첫 번째 열값 null
                let allCustomerSame = true;
                if (customers[0] === null) {
                    const baseCust = customers[1];
                    allCustomerSame = customers.slice(1).every(cust => cust === baseCust);
                } else {
                    allCustomerSame = customers.every(cust => cust === customers[0]);
                }

                //console.log("✅ allAddressSame:", allAddressSame);
                //console.log("✅ allCustomerSame:", allCustomerSame);

                // 주소와 주문자가 모두 동일할 경우
                if (allAddressSame && allCustomerSame) {
                    // 판매 전송 버튼 클릭
                    sendSellBtn.click();

                    // 마지막 주문자 값 사용
                    const valueToInsert = customers[customers.length - 1] || '';
                    // 마지막 주소 값 사용
                    const firstAddress = addresses[addresses.length - 1] || '';

                    // 주소 -> 담당자 매핑
                    let empValue = '';
                    if (/서울|강원|인천/.test(firstAddress)) {
                        empValue = '고일재';
                    } else if (/경기도|충청|대전|세종/.test(firstAddress)) {
                        empValue = '임문희';
                    } else{
                        empValue = '김철현';
                    }

                    // 고정 직배 이름 목록 배열
                    // 주문자명
                    const names = ['곽정근', '정계은', '이민기', '최우진', '정두선', '정지원'];
                    // 목록에 포함되어 있으면 알림창 표시
                    if (names.includes(valueToInsert)){
                        alert("고정직배 확인");
                    }

                    // 품목필터 목록 배열
                    // 주문자명
                    const itemFilter = ['(냉)'];
                    // 목록에 포함되어 있으면 알림창 표시
                    if (
                        items.length >= 2 &&
                        items.some(item => item && itemFilter.some(filter => item.includes(filter)))
                    ) {
                        alert("냉장 제품이 포함되어 있습니다.");
                    }

                    // 거래처 입력칸(data-cid="cust")와 담당자 입력칸(data-cid="emp_cd") 감지
                    const observer = new MutationObserver((mutations, obs) => {
                        // 주문자명 값 찾기
                        const custInput = document.querySelector('input[data-cid="cust"]');
                        //담당자 값 찾기
                        const empInput = document.querySelector('input[data-cid="emp_cd"]');

                        if (custInput && empInput) {
                            empInput.value = empValue; // 담당자 값 입력
                            custInput.value = valueToInsert; // 주문자 값 입력

                            obs.disconnect(); // 감지 중단
                        }
                    });
                    observer.observe(document.body, { childList: true, subtree: true });

                    // 5초 후 자동 중단 (타임아웃 처리)
                    setTimeout(() => {
                        observer.disconnect();
                        console.warn('⏱️ 거래처/담당자 입력 대기 시간 초과');
                    }, 5000);
                }

                // 주소 또는 주문자가 다를 경우
                else {
                    const proceed = confirm('선택된 주소 또는 주문자가 2건 이상입니다. 진행하시겠습니까?');
                    if (proceed) {
                        // 판매 전송 버튼 클릭
                        sendSellBtn.click();
                    }
                }
            }
        }
    });
