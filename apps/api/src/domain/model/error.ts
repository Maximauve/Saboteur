export class ApiErrorResponse {
	status: number;
	data: {
		message: string[]|string;
		statusCode: string;
	}
}
