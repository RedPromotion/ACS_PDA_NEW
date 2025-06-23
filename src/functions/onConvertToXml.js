/**
 * 객체 배열을 XML 문자열로 변환합니다.
 * 각 객체의 속성을 XML 자식 엘리먼트로 변환합니다.
 *
 * @param {Array<Object>} dataArray - 변환할 객체 배열 (예: DataGrid rows).
 * @param {string} rootElementName - 루트 엘리먼트 이름 (예: "rows").
 * @param {string} itemElementName - 각 객체를 나타낼 엘리먼트 이름 (예: "row").
 * @returns {string} 생성된 XML 문자열.
 * @example
    const rows = [
        { id: 1, name: "Apple", price: 1000 },
        { id: 2, name: "Orange", price: 2000 }
    ];
    const xmlResult = onConvertToXml(rows);
    console.log(xmlResult);
 */
export const onConvertToXml = (dataArray, rootElementName = 'rows', itemElementName = 'row') => {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
        return `<${rootElementName}/>`;
    }

    const escapeXml = (value) => {
        if (value === null || value === undefined) return '';
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    };

    const xmlItems = dataArray.map(item => {
        const innerXml = Object.entries(item)
            .map(([key, value]) => `<${key}>${escapeXml(value)}</${key}>`)
            .join('');
        return `    <${itemElementName}>${innerXml}</${itemElementName}>`;
    });

    return `<${rootElementName}>\n${xmlItems.join('\n')}\n</${rootElementName}>`;
};

/*  
    ----------------
    //프론트 사용 예시
    ----------------

    //프론트에서의 할당
    const rows = [
        { id: 1, name: "Apple", price: 1000 },
        { id: 2, name: "Orange", price: 2000 }
    ];
    const xmlResult = onConvertToXml(rows);
    console.log(xmlResult);

    //출력결과
    <rows>
        <row><id>1</id><name>Apple</name><price>1000</price></row>
        <row><id>2</id><name>Orange</name><price>2000</price></row>
    </rows>

*/
/*
    ------------------------------------------------------------
    -- XML 문자열 선언 테스트 T-SQL 
    ------------------------------------------------------------

    -- 1. XML 문자열 변수 선언 및 할당
    DECLARE @xmlData NVARCHAR(MAX);
    SET @xmlData = '
    <rows>
        <row><id>1</id><name>Apple</name><price>1000</price></row>
        <row><id>2</id><name>Orange</name><price>2000</price></row>
        <row><id>3</id><name>Banana</name><price>800</price></row>
    </rows>';

    -- 2. XML 파싱을 위한 핸들 변수 선언
    DECLARE @hDoc INT;

    -- 3. sp_xml_preparedocument를 사용하여 XML을 메모리에 로드하고 핸들 획득
    -- 이 과정에서 XML의 유효성이 검사됩니다.
    EXEC sp_xml_preparedocument @hDoc OUTPUT, @xmlData;

    -- 4. OPENXML을 사용하여 메모리 내 XML에서 데이터를 관계형 ROWSET으로 추출하고 SELECT
    -- '/rows/row'는 XML 내에서 각 데이터 항목을 나타내는 경로입니다.
    -- 플래그 '1'은 자식 엘리먼트 기반 매핑을 의미합니다. (id, name, price가 <row>의 자식 엘리먼트이므로)
    SELECT
        id,
        name,
        price
    FROM OPENXML(@hDoc, '/rows/row', 1)
    WITH (
        id INT 'id',                   -- XML의 <id> 엘리먼트를 INT 타입의 'id' 컬럼으로 매핑
        name NVARCHAR(255) 'name',     -- XML의 <name> 엘리먼트를 NVARCHAR(255) 타입의 'name' 컬럼으로 매핑
        price DECIMAL(10, 2) 'price'   -- XML의 <price> 엘리먼트를 DECIMAL(10,2) 타입의 'price' 컬럼으로 매핑
    );

    -- 5. sp_xml_removedocument를 사용하여 메모리에서 XML 문서 해제 (필수!)
    EXEC sp_xml_removedocument @hDoc;
    
*/
/*
    ------------------------------------------------------------
    -- MSSQL 2008 이상 부터 사용하는 파싱 (내장 프로시저 활용하기)
    ------------------------------------------------------------
    
    CREATE PROCEDURE usp_ParseAndInsertXmlData
        @xmlData XML
    AS
    BEGIN
        SET NOCOUNT ON;

        DECLARE @docHandle INT;

        -- XML 문서 파싱 핸들 생성 (필수)
        EXEC sp_xml_preparedocument @docHandle OUTPUT, @xmlData;

        -- OPENXML을 통해 XML 데이터를 테이블 형식으로 변환 후 INSERT
        INSERT INTO YourTargetTable (id, name, price)
        SELECT 
            id, 
            name, 
            price
        FROM OPENXML(@docHandle, '/Items/Item', 2)  -- 2는 ELEMENT 형식
        WITH (
            id INT,
            name VARCHAR(100),
            price INT
        );

        -- XML 핸들 해제 (메모리 누수 방지)
        EXEC sp_xml_removedocument @docHandle;
    END

*/