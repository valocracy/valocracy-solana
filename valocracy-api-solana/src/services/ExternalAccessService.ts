/* eslint-disable @typescript-eslint/no-explicit-any */
import env from '@/config';
import ExternalAccessDatabase from '@/database/ExternalAccessDatabase';
import Mailer from '@/services/MailerService';
import { getErrorMessage } from '@/helpers/response_collection';
import { maskEmail } from '@/helpers/util';
import { ExternalAccessInterface } from '@/interfaces/ExternalAccessInterface';

class ExternalAccessService {
	private database: ExternalAccessDatabase;

	constructor() {
		this.database = new ExternalAccessDatabase();
	}

	private getMailCodeHtmlBody(data: any) {
		if (!data?.code) throw Error(getErrorMessage('missingField', 'Codigo'));
		if (!data?.email) throw Error(getErrorMessage('missingField', 'Email'));
		if (!data?.username) throw Error(getErrorMessage('missingField', 'Nome de usuario'));

		const style = `
		
		/* Base ------------------------------ */
		  
		@import url("https://fonts.googleapis.com/css?family=Nunito+Sans:400,700&display=swap");
		body {
		  width: 100% !important;
		  height: 100%;
		  margin: 0;
		  -webkit-text-size-adjust: none;
		}
		
		a {
		  color: #3869D4;
		}
		
		a img {
		  border: none;
		}
		
		td {
		  word-break: break-word;
		}
		
		.preheader {
		  display: none !important;
		  visibility: hidden;
		  mso-hide: all;
		  font-size: 1px;
		  line-height: 1px;
		  max-height: 0;
		  max-width: 0;
		  opacity: 0;
		  overflow: hidden;
		}
		/* Type ------------------------------ */
		
		body,
		td,
		th {
		  font-family: "Nunito Sans", Helvetica, Arial, sans-serif;
		}
		
		h1 {
		  margin-top: 0;
		  color: #333333;
		  font-size: 22px;
		  font-weight: bold;
		  text-align: left;
		}
		
		h2 {
		  margin-top: 0;
		  color: #333333;
		  font-size: 16px;
		  font-weight: bold;
		  text-align: left;
		}
		
		h3 {
		  margin-top: 0;
		  color: #333333;
		  font-size: 14px;
		  font-weight: bold;
		  text-align: left;
		}
		
		td,
		th {
		  font-size: 16px;
		}
		
		p,
		ul,
		ol,
		blockquote {
		  margin: .4em 0 1.1875em;
		  font-size: 16px;
		  line-height: 1.625;
		}
		
		p.sub {
		  font-size: 13px;
		}
		/* Utilities ------------------------------ */
		
		.align-right {
		  text-align: right;
		}
		
		.align-left {
		  text-align: left;
		}
		
		.align-center {
		  text-align: center;
		}
		
		.u-margin-bottom-none {
		  margin-bottom: 0;
		}
		/* Buttons ------------------------------ */
		
		.button {
		  background-color: #3869D4;
		  border-top: 10px solid #3869D4;
		  border-right: 18px solid #3869D4;
		  border-bottom: 10px solid #3869D4;
		  border-left: 18px solid #3869D4;
		  display: inline-block;
		  color: #FFF;
		  text-decoration: none;
		  border-radius: 3px;
		  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16);
		  -webkit-text-size-adjust: none;
		  box-sizing: border-box;
		}
		
		.button--green {
		  background-color: #22BC66;
		  border-top: 10px solid #22BC66;
		  border-right: 18px solid #22BC66;
		  border-bottom: 10px solid #22BC66;
		  border-left: 18px solid #22BC66;
		}
		
		.button--red {
		  background-color: #FF6136;
		  border-top: 10px solid #FF6136;
		  border-right: 18px solid #FF6136;
		  border-bottom: 10px solid #FF6136;
		  border-left: 18px solid #FF6136;
		}
		
		@media only screen and (max-width: 500px) {
		  .button {
			width: 100% !important;
			text-align: center !important;
		  }
		}
		/* Attribute list ------------------------------ */
		
		.attributes {
		  margin: 0 0 21px;
		}
		
		.attributes_content {
		  background-color: #F4F4F7;
		  padding: 16px;
		}
		
		.attributes_item {
		  padding: 0;
		}
		/* Related Items ------------------------------ */
		
		.related {
		  width: 100%;
		  margin: 0;
		  padding: 25px 0 0 0;
		  -premailer-width: 100%;
		  -premailer-cellpadding: 0;
		  -premailer-cellspacing: 0;
		}
		
		.related_item {
		  padding: 10px 0;
		  color: #CBCCCF;
		  font-size: 15px;
		  line-height: 18px;
		}
		
		.related_item-title {
		  display: block;
		  margin: .5em 0 0;
		}
		
		.related_item-thumb {
		  display: block;
		  padding-bottom: 10px;
		}
		
		.related_heading {
		  border-top: 1px solid #CBCCCF;
		  text-align: center;
		  padding: 25px 0 10px;
		}
		/* Discount Code ------------------------------ */
		
		.discount {
		  width: 100%;
		  margin: 0;
		  padding: 24px;
		  -premailer-width: 100%;
		  -premailer-cellpadding: 0;
		  -premailer-cellspacing: 0;
		  background-color: #F4F4F7;
		  border: 2px dashed #CBCCCF;
		}
		
		.discount_heading {
		  text-align: center;
		}
		
		.discount_body {
		  text-align: center;
		  font-size: 15px;
		}
		/* Social Icons ------------------------------ */
		
		.social {
		  width: auto;
		}
		
		.social td {
		  padding: 0;
		  width: auto;
		}
		
		.social_icon {
		  height: 20px;
		  margin: 0 8px 10px 8px;
		  padding: 0;
		}
		/* Data table ------------------------------ */
		
		.purchase {
		  width: 100%;
		  margin: 0;
		  padding: 35px 0;
		  -premailer-width: 100%;
		  -premailer-cellpadding: 0;
		  -premailer-cellspacing: 0;
		}
		
		.purchase_content {
		  width: 100%;
		  margin: 0;
		  padding: 25px 0 0 0;
		  -premailer-width: 100%;
		  -premailer-cellpadding: 0;
		  -premailer-cellspacing: 0;
		}
		
		.purchase_item {
		  padding: 10px 0;
		  color: #51545E;
		  font-size: 15px;
		  line-height: 18px;
		}
		
		.purchase_heading {
		  padding-bottom: 8px;
		  border-bottom: 1px solid #EAEAEC;
		}
		
		.purchase_heading p {
		  margin: 0;
		  color: #85878E;
		  font-size: 12px;
		}
		
		.purchase_footer {
		  padding-top: 15px;
		  border-top: 1px solid #EAEAEC;
		}
		
		.purchase_total {
		  margin: 0;
		  text-align: right;
		  font-weight: bold;
		  color: #333333;
		}
		
		.purchase_total--label {
		  padding: 0 15px 0 0;
		}
		
		body {
		  background-color: #F2F4F6;
		  color: #51545E;
		}
		
		p {
		  color: #51545E;
		}
		
		.email-wrapper {
		  width: 100%;
		  margin: 0;
		  padding: 0;
		  -premailer-width: 100%;
		  -premailer-cellpadding: 0;
		  -premailer-cellspacing: 0;
		  background-color: #F2F4F6;
		}
		
		.email-content {
		  width: 100%;
		  margin: 0;
		  padding: 0;
		  -premailer-width: 100%;
		  -premailer-cellpadding: 0;
		  -premailer-cellspacing: 0;
		}
		/* Masthead ----------------------- */
		
		.email-masthead {
		  padding: 25px 0;
		  text-align: center;
		}
		
		.email-masthead_logo {
		  width: 94px;
		}
		
		.email-masthead_name {
		  font-size: 16px;
		  font-weight: bold;
		  color: #A8AAAF;
		  text-decoration: none;
		  text-shadow: 0 1px 0 white;
		}
		/* Body ------------------------------ */
		
		.email-body {
		  width: 100%;
		  margin: 0;
		  padding: 0;
		  -premailer-width: 100%;
		  -premailer-cellpadding: 0;
		  -premailer-cellspacing: 0;
		}
		
		.email-body_inner {
		  width: 570px;
		  margin: 0 auto;
		  padding: 0;
		  -premailer-width: 570px;
		  -premailer-cellpadding: 0;
		  -premailer-cellspacing: 0;
		  background-color: #FFFFFF;
		}
		
		.email-footer {
		  width: 570px;
		  margin: 0 auto;
		  padding: 0;
		  -premailer-width: 570px;
		  -premailer-cellpadding: 0;
		  -premailer-cellspacing: 0;
		  text-align: center;
		}
		
		.email-footer p {
		  color: #A8AAAF;
		}
		
		.body-action {
		  width: 100%;
		  margin: 30px auto;
		  padding: 0;
		  -premailer-width: 100%;
		  -premailer-cellpadding: 0;
		  -premailer-cellspacing: 0;
		  text-align: center;
		}
		
		.body-sub {
		  margin-top: 25px;
		  padding-top: 25px;
		  border-top: 1px solid #EAEAEC;
		}
		
		.content-cell {
		  padding: 45px;
		}
		/*Media Queries ------------------------------ */
		
		@media only screen and (max-width: 600px) {
		  .email-body_inner,
		  .email-footer {
			width: 100% !important;
		  }
		}
		
		@media (prefers-color-scheme: dark) {
		  body,
		  .email-body,
		  .email-body_inner,
		  .email-content,
		  .email-wrapper,
		  .email-masthead,
		  .email-footer {
			background-color: #333333 !important;
			color: #FFF !important;
		  }
		  p,
		  ul,
		  ol,
		  blockquote,
		  h1,
		  h2,
		  h3,
		  span,
		  .purchase_item {
			color: #FFF !important;
		  }
		  .attributes_content,
		  .discount {
			background-color: #222 !important;
		  }
		  .email-masthead_name {
			text-shadow: none !important;
		  }
		}
		
		:root {
		  color-scheme: light dark;
		  supported-color-schemes: light dark;
		}
		</style>
		<!--[if mso]>
		<style type="text/css">
		  .f-fallback  {
			font-family: Arial, sans-serif;
		  }
		`;
		// const securityInfo: string = `Por segurança, essa requisição foi enviada pelo dispositivo ${data.operating_system || ''} usando ${data.browser_name || ''}. `;

		return `<html xmlns="http://www.w3.org/1999/xhtml">
		<head>
		  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
		  <meta name="x-apple-disable-message-reformatting" />
		  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		  <meta name="color-scheme" content="light dark" />
		  <meta name="supported-color-schemes" content="light dark" />
		  <title></title>
		  <style type="text/css" rel="stylesheet" media="all">
		  	${style}
		  </style>
		</head>
		<body>
		  <span class="preheader">Use this link to reset your password. The link is only valid for 24 hours.</span>
		  <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
			<tr>
			  <td align="center">
				<table class="email-content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
				  <tr>
					<td class="email-masthead">
					  <a href="https://example.com" class="f-fallback email-masthead_name">
					  Whatspice
					</a>
					</td>
				  </tr>
				  <!-- Email Body -->
				  <tr>
					<td class="email-body" width="570" cellpadding="0" cellspacing="0">
					  <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
						<!-- Body content -->
						<tr>
						  <td class="content-cell">
							<div class="f-fallback">
							  <h2>Ola ${data.username}!</h2>
							  <p>Use o código de seguranca a seguir para prosseguir com a vinculação da conta <b>${data.email}</b> com o Hotmart na <b>Valocracy</b>.</strong></p>
							  <!-- Action -->
							  <table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation">
								<tr>
								  <td align="center">
									<!-- Border based button
				 https://litmus.com/blog/a-guide-to-bulletproof-buttons-in-email-design -->
									<table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
									  <tr>
										<td align="center">
										  <b>${data.code}</b>
										</td>
									  </tr>
									</table>
								  </td>
								</tr>
							  </table>
							  <p><b>Abraços,
								<br>Equipe Valocracy</b></p>
							</div>
						  </td>
						</tr>
					  </table>
					</td>
				  </tr>
				  <tr>
					<td>
					  <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
						<tr>
						  <td class="content-cell" align="center">
							<p class="f-fallback sub align-center">
								Valocracy
							</p>
						  </td>
						</tr>
					  </table>
					</td>
				  </tr>
				</table>
			  </td>
			</tr>
		  </table>
		</body>
	  </html>`;
	}

	async sendMailCode(data: any) {
		const mailer = new Mailer();
		const emailMasked = maskEmail(data.recipient_email);
		const emailHtmlBody = this.getMailCodeHtmlBody({
			email: emailMasked,
			code: data.code,
			username: data.username
		});
		const text = `Use o código de seguranca a seguir para prosseguir a vinculação da conta ${emailMasked} do Hotmart na Valocracia\n\n${data.code}\n\nAbraços,\nEquipe Valocracia`;

		await mailer.send({
			from: env.MAIL_SENDER,
			to: data.recipient_email,
			subject: 'Código de segurança da conta do Valocracia',
			text: text,
			html: emailHtmlBody
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} as any);

	}

	async fetchByUser(id: number): Promise<Array<any>> {
		if (!id) throw Error(getErrorMessage('missingField', 'Id do usuário'));

		const creatorChannel = await this.database.fetchByUserAccount(id);

		return creatorChannel;
	}

	async userHasEmailInList(id: number): Promise<boolean> {
		if (!id) throw Error(getErrorMessage('missingField', 'Id do usuário'));

		const creatorChannel = await this.database.fetchByUserAccount(id);

		return creatorChannel.length > 0;
	}

	async isEmailInList(email: string): Promise<boolean> {
		if (!email) throw Error(getErrorMessage('missingField', 'Email'));

		const creatorChannel = await this.database.fetchByEmail(email);

		return creatorChannel.length > 0;
	}

	async create(data: ExternalAccessInterface): Promise<number> {
		if (!data.email) throw Error(getErrorMessage('missingField', 'Email'));
		if (!data?.user_account_id === undefined) throw Error(getErrorMessage('missingField', 'Id do usuário'));

		const insertData = {
			email: data.email,
			user_account_id: data.user_account_id,
			community_server_id: 1
		};

		const result: any = await this.database.create(insertData);
		return result[0].insertId;
	}

	async removeByUser(id: number): Promise<void> {
		await this.database.deleteByUser(id);
	}
}

export default ExternalAccessService;
