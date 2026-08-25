import { Alert, Typography } from "antd";
const { Title, Paragraph } = Typography;
export function CallbackRequestsInstruction() {
  return <Typography>
    <Title level={3}>Работа с заявками</Title>
    <Paragraph>Во вкладке «Заявки» отображаются обращения с сайта. Используйте период, статусы, признак спама и regex-поиск по имени, телефону или комментарию. Сортировка доступна по дате и статусу, страницы переключаются пагинатором.</Paragraph>
    <Paragraph>Нажмите строку, чтобы увидеть заявку полностью. Телефон открывает приложение для звонка. Пользователи ADMIN и SUPERUSER могут изменить статус или признак спама через значение в таблице.</Paragraph>
    <Alert type="info" showIcon message="При пометке как спам заявка автоматически получает статус «Обработана». Снятие признака спама статус не меняет." />
  </Typography>;
}
