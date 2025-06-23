const API_config = {
    IP: '192.168.25.74',
    PORT: '8332',
    PATH: '/API'
}
const API_SET = `http://${API_config.IP}:${API_config.PORT}${API_config.PATH}`
window.PDA_API = {
    DEFAULT_API_TYPE : "api", //고정값
    API_URL: API_SET, //API 주소
    GENRAL_URL: `${API_SET}/ServiceExecute/pda/general`,
    DATETIME_URL: `${API_SET}/ServiceExecute/pda/dt`,
    DICTIONARY_URL: `${API_SET}/ServiceExecute/pda/dictionary`,
    OUTPUT_PARAMETER_URL: `${API_SET}/ServiceExecute/pda/outputparameter`,
    OUTPUTP_PARAMETER_FRONT_URL: `${API_SET}/ServiceExecute/pda/outputparameter/front`,
};