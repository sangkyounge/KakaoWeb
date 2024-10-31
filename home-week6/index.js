let Add_Index = 10;

// jar-walls 이벤트 설정
const jarWalls = document.querySelector('.jar-walls');
const jarGlossyLong = document.querySelector('.jar-glossy-long');

if (jarWalls) {
    jarWalls.addEventListener('dragenter', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });

    jarWalls.addEventListener('dragleave', function(e) {
        this.classList.remove('drag-over');
    });

    jarWalls.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        this.style.transform = 'scale(1)';
        this.style.backgroundColor = '';
        console.log('Drop 이벤트 발생!'); // 여기에 추가
        
        const draggedPlant = document.querySelector('.plant.dragging');
        if (draggedPlant) {
            const jarRect = this.getBoundingClientRect();
            const x = e.clientX - jarRect.left - draggedPlant.offsetWidth / 2;
            const y = e.clientY - jarRect.top - draggedPlant.offsetHeight / 2;
    
            draggedPlant.style.position = 'absolute';
            draggedPlant.style.left = `${x}px`;
            draggedPlant.style.top = `${y}px`;
            
            this.appendChild(draggedPlant);
            
            Add_Index++;
            draggedPlant.style.zIndex = Add_Index;
            console.log('🌿 식물이 성공적으로 테라리움에 추가되었습니다!'); // 여기에 추가
        }
    });

// 모든 식물 요소에 드래그 기능 추가
for (let i = 1; i <= 14; i++) {
    const plant = document.getElementById(`plant${i}`);
    if (plant) {
        plant.setAttribute('draggable', 'true');
        
        // dragstart 이벤트 리스너
        plant.addEventListener('dragstart', function(e) {
            this.classList.add('dragging');
            this.style.opacity = '0.7';
            
            // 드래그 시작 위치 저장
            const rect = this.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;
            e.dataTransfer.setData('text/plain', `${offsetX},${offsetY}`);
            
            requestAnimationFrame(() => {
                this.style.opacity = '0.5';
                this.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
                this.style.filter = 'brightness(150%)';
                this.style.borderRadius = '50%';
                this.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.3)';
            });
        });

        // drag 이벤트
        plant.addEventListener('drag', function(e) {
            if(!e.clientX && !e.clientY) return;
            
            requestAnimationFrame(() => {
                this.style.opacity = '0.5';
                this.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
                this.style.filter = 'brightness(150%)';
                this.style.borderRadius = '50%';
                this.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.3)';
            });
        });

        // dragend 이벤트
        // dragend 이벤트 수정
        plant.addEventListener('dragend', function(e) {
            console.log('Dragend 이벤트 발생!'); // 여기에 추가
            this.classList.remove('dragging');
            this.style.opacity = '1';
            this.style.backgroundColor = '';
            this.style.filter = '';
            this.style.boxShadow = '';
            
            const jarWalls = document.querySelector('.jar-walls');
            if (jarWalls && jarWalls.contains(this)) {
                console.log('✨ 드래그가 성공적으로 완료되었습니다!'); // 여기에 추가
            }
        });

        // Pointer 드래그 기능 추가
        dragElement(plant);
    }
}

function dragElement(terrariumElement) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false;
    
    terrariumElement.onpointerdown = pointerDrag;
    
    // 더블클릭으로 z-index 조정
    terrariumElement.ondblclick = () => {
        Add_Index++;
        terrariumElement.style.zIndex = Add_Index;
    }
    
    function pointerDrag(e) {
        e.preventDefault();
        
        // 드래그 시작 위치 저장
        const rect = terrariumElement.getBoundingClientRect();
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        document.onpointermove = elementDrag;
        document.onpointerup = stopElementDrag;
        
        isDragging = true;
        terrariumElement.style.opacity = '0.7';
        terrariumElement.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
        terrariumElement.style.borderRadius = '50%';
        terrariumElement.style.filter = 'brightness(150%)';
        terrariumElement.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.3)';
    }
    
    function elementDrag(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        
        // 새로운 위치 계산
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // 위치 업데이트
        const newTop = terrariumElement.offsetTop - pos2;
        const newLeft = terrariumElement.offsetLeft - pos1;
        
        terrariumElement.style.top = `${newTop}px`;
        terrariumElement.style.left = `${newLeft}px`;
        
        // 테라리움과의 충돌 감지
        const jarWalls = document.querySelector('.jar-walls');
        if (jarWalls) {
            const jarRect = jarWalls.getBoundingClientRect();
            const plantRect = terrariumElement.getBoundingClientRect();
            
            if (!(plantRect.right < jarRect.left || 
                plantRect.left > jarRect.right || 
                plantRect.bottom < jarRect.top || 
                plantRect.top > jarRect.bottom)) {
                jarWalls.classList.add('drag-over');
            } else {
                jarWalls.classList.remove('drag-over');
            }
        }
    }
    
    function stopElementDrag() {
        document.onpointermove = null;
        document.onpointerup = null;
        isDragging = false;
        
        terrariumElement.style.opacity = '1';
        terrariumElement.style.backgroundColor = '';
        terrariumElement.style.filter = '';
        terrariumElement.style.boxShadow = '';
        
        // jar-walls 색상 초기화
        if (jarWalls) {
            jarWalls.classList.remove('drag-over');
        }
    }
}
}