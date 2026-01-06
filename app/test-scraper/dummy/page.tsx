/**
 * 더미 상품 페이지 (스크래퍼 테스트용)
 */

export default function DummyProductPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        <div className="flex gap-8">
          {/* 이미지 영역 */}
          <div className="w-1/2 bg-gray-200 rounded aspect-square flex items-center justify-center">
            <span className="text-gray-400">상품 이미지</span>
          </div>

          {/* 정보 영역 */}
          <div className="w-1/2 space-y-4">
            <h1 className="text-3xl font-bold">테스트 상품 - 나이키 에어맥스</h1>
            
            <div className="text-2xl font-semibold text-blue-600">
              ₩159,000
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">사이즈 선택</p>
              <div className="grid grid-cols-4 gap-2">
                <button className="border rounded px-3 py-2 hover:border-blue-500 line-through text-gray-400">
                  260
                </button>
                <button className="border rounded px-3 py-2 hover:border-blue-500">
                  270
                </button>
                <button className="border rounded px-3 py-2 hover:border-blue-500">
                  280
                </button>
                <button className="border rounded px-3 py-2 hover:border-blue-500 line-through text-gray-400">
                  290
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">색상 선택</p>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full bg-red-500 border-2 border-blue-600"></button>
                <button className="w-10 h-10 rounded-full bg-blue-500 border-2 border-transparent"></button>
                <button className="w-10 h-10 rounded-full bg-black border-2 border-transparent"></button>
              </div>
            </div>

            <div className="pt-4">
              <div className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded">
                재고 있음
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
                장바구니 담기
              </button>
              <button className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800">
                바로 구매
              </button>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">상품 정보</h3>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• 브랜드: Nike</li>
                <li>• 모델: Air Max 270</li>
                <li>• 소재: 합성 섬유</li>
                <li>• 원산지: 베트남</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-8">
          <h2 className="text-xl font-bold mb-4">상품 상세설명</h2>
          <div className="prose max-w-none text-gray-600">
            <p>
              나이키 에어맥스는 편안함과 스타일을 동시에 제공하는 클래식한 운동화입니다.
              독특한 에어 쿠셔닝 시스템으로 뛰어난 충격 흡수 능력을 자랑합니다.
            </p>
            <p className="mt-4">
              다양한 색상과 사이즈로 제공되며, 일상적인 착용부터 가벼운 운동까지
              완벽하게 소화할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

