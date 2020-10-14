/**
 * @author Arhangel31337
 * @copyright MitLab
 */

(function ($) {
	let card;

	let cards;

	const methods = {
		cleaning: function (string) {
			string = string.replace(/[^0-9]/g, '');
			string = string.trim();

			return string;
		},
		setCard: function (cardNumber) {
			card = null;

			let firstChars = cardNumber[0] - 0;

			switch (firstChars) {
				case 2:
					card = cards.mir;
					break;
				case 4:
					card = cards.visa;
					break;
			}

			if (card === null) {
				firstChars = cardNumber.substring(0, 2) - 0;

				switch (firstChars) {
					case 51:
					case 52:
					case 53:
					case 54:
					case 55:
						card = cards.master;
						break;
					case 50:
					case 56:
					case 57:
					case 58:
					case 63:
					case 67:
						card = cards.maestro;
						break;
				}
			}

			if (card === null) card = cards.default;
		},
		setNumberView: function (cardNumber) {
			const maxLength = card.placeholder.replace(/ /g, '').length;

			let spaces = Array.from(card.placeholder.matchAll(/ /g));

			cardNumber = cardNumber.substring(0, maxLength);

			for (let i = 0; i < spaces.length; i++) {
				if (cardNumber.length < spaces[i].index) break;

				const length = spaces[i].index;
				const subStrBefore = cardNumber.substring(0, length);
				const subStrAfter = cardNumber.substring(length);

				cardNumber = subStrBefore + ' ' + subStrAfter;
			}

			return [cardNumber, spaces];
		},
		testCard: function (settings) {
			let allDataDone = true;

			if (card !== undefined) {
				let numberLength =
					card.placeholder.replace(/ /g, '').length +
					Array.from(card.placeholder.matchAll(/ /g)).length;

				if (settings.numberInput.val().length !== numberLength) allDataDone = false;

				if (allDataDone) {
					const luhnTestResult = methods.testLuhn(settings.numberInput.val());

					if (!luhnTestResult) {
						allDataDone = false;
						settings.errorBlock.html(settings.errorBlockNotDone);
					} else settings.errorBlock.html(settings.errorBlockDone);
				}
			} else allDataDone = false;

			if (settings.validityInput.val().length !== 7) allDataDone = false;
			if (settings.cvcInput.val().length !== 3) allDataDone = false;

			if (!allDataDone) settings.submitButton.attr('disabled', 'disabled');
			else settings.submitButton.removeAttr('disabled');

			return allDataDone;
		},
		testCardCvc: function (cardCvc, target, settings) {
			let caretPosition = target.selectionEnd;

			cardCvc = methods.cleaning(cardCvc);
			cardCvc = cardCvc.substring(0, 3);

			target.value = cardCvc;
			target.setSelectionRange(caretPosition, caretPosition);

			methods.testCard(settings);
		},
		testCardNumber: function (cardNumber, target, settings) {
			let caretPosition = target.selectionEnd;

			cardNumber = methods.cleaning(cardNumber);
			methods.setCard(cardNumber);
			[cardNumber, spaces] = methods.setNumberView(cardNumber);

			settings.imageBlock.html(card.logo);
			settings.numberInput.val(cardNumber);
			settings.numberInput.attr('placeholder', card.placeholder);

			for (let i = 0; i < spaces.length; i++) {
				if (caretPosition === spaces[i].index) {
					caretPosition++;
					break;
				}
			}

			target.setSelectionRange(caretPosition, caretPosition);

			methods.testCard(settings);
		},
		testCardValidity: function (cardValidity, target, settings) {
			if (target === undefined) return;

			let caretPosition = target.selectionEnd;

			cardValidity = methods.cleaning(cardValidity);
			cardValidity = cardValidity.substring(0, 4);

			let month = (cardValidity.substring(0, 2) !== '') ? cardValidity.substring(0, 2) - 0: null;
			let year = (cardValidity.substring(2) !== '') ? cardValidity.substring(2) - 0 : null;

			const now = new Date();

			let monthNow = now.getMonth() + 1;
			let yearNow = now.getFullYear() - 2000;

			if (year !== null) {
				if (year < yearNow && year > 10) year = yearNow;
				else if (year > (yearNow + 7)) year = yearNow + 7;

				if (year === yearNow && month < monthNow) month = monthNow;
				else if (year === (yearNow + 7) && month > monthNow) month = monthNow;
			}

			if (month !== null) {
				if (month > 12) month = '12';
				else if (month < 10 && month > 1) month = '0' + month;
				else if (month === 1 && cardValidity[0] === '0')month = '0' + month;
				else month = '' + month;
			}

			if (year !== null) cardValidity = month + year;
			else if (month !== null) cardValidity = month;

			if (cardValidity.length === 1 && cardValidity !== '0' && cardValidity !== '1') cardValidity = '0' + cardValidity;

			if (cardValidity.length > 2) {
				const subStrBefore = cardValidity.substring(0, 2);
				const subStrAfter = cardValidity.substring(2);

				cardValidity = subStrBefore + ' / ' + subStrAfter;
			}

			target.value = cardValidity;

			if (caretPosition === 3) caretPosition = 6;

			target.setSelectionRange(caretPosition, caretPosition);

			this.testCard(settings);
		},
		testLuhn: function (cardNumber) {
			cardNumber = methods.cleaning(cardNumber);

			let sum = 0;

			for (let i = 0; i < cardNumber.length; i++) {
				let number = cardNumber[i] - 0;

				if ((i % 2) === 0) number *= 2;
				if (number > 9) number -= 9;

				sum += number;
			}

			return (sum % 10) === 0;
		},
		verifyOptions: function (options) {
			let errors = [];

			if (options.cards === undefined)
				errors[errors.length] = 'cards: не найдено.';
			if (options.cvcInput === undefined || options.cvcInput.length === 0)
				errors[errors.length] = 'cvcInput: не найдено.';
			if (options.numberInput === undefined || options.numberInput.length === 0)
				errors[errors.length] = 'numberInput: не найдено.';
			if (options.imageBlock === undefined || options.imageBlock.length === 0)
				errors[errors.length] = 'imageBlock: не найдено.';
			if (options.submitButton === undefined || options.submitButton.length === 0)
				errors[errors.length] = 'submitButton: не найдено.';
			if (options.validityInput === undefined || options.validityInput.length === 0)
				errors[errors.length] = 'validityInput: не найдено.';
			if (options.errorBlock === undefined || options.errorBlock.length === 0)
				errors[errors.length] = 'errorBlock: не найдено.';
			if (options.errorBlockDone === undefined || options.errorBlockDone.length === 0)
				errors[errors.length] = 'errorBlockDone: не найдено.';
			if (options.errorBlockNotDone === undefined || options.errorBlockNotDone.length === 0)
				errors[errors.length] = 'errorBlockNotDone: не найдено.';

			let issetErrors = false;

			if (errors.length > 0) issetErrors = true;

			return {state: issetErrors, errors: errors};
		}
	};

	let permittedKeys = [16, 35, 36, 37, 39];

	$.fn.cardValidator = function (options) {
		const optionsErrors = methods.verifyOptions(options);

		if (optionsErrors.state) return console.log(optionsErrors.errors);

		cards = options.cards;

		this.each(function () {
			const el = $(this);

			const settings = {
				cvcInput: el.find(options.cvcInput),
				numberInput: el.find(options.numberInput),
				imageBlock: el.find(options.imageBlock),
				submitButton: el.find(options.submitButton),
				validityInput: el.find(options.validityInput),
				errorBlock: el.find(options.errorBlock),
				errorBlockDone: options.errorBlockDone,
				errorBlockNotDone: options.errorBlockNotDone
			};

			settings.numberInput.change(function (e) {
				methods.testCardNumber(e.target.value, e.target, settings);
			});

			settings.numberInput.keydown(function (e) {
				if (e.originalEvent.keyCode === 8 && e.target.value[e.target.selectionEnd - 1] === ' ') {
					e.target.value = e.target.value.substring(0, (e.target.value.length - 1));
				}
			});

			settings.numberInput.keyup(function (e) {
				if (permittedKeys.indexOf(e.originalEvent.keyCode) !== -1) return;

				methods.testCardNumber(e.target.value, e.target, settings);
			});

			settings.validityInput.change(function (e) {
				methods.testCardValidity(e.target.value, e.target, settings);
			});

			settings.validityInput.keydown(function (e) {
				if (e.originalEvent.keyCode === 8 && e.target.selectionEnd === 5) {
					const subStrBefore = e.target.value.substring(0, 1);
					const subStrAfter = e.target.value.substring(5);

					e.target.value = subStrBefore + subStrAfter;

					e.target.setSelectionRange(1, 1);

					return false;
				}
			});

			settings.validityInput.keyup(function (e) {
				if (permittedKeys.indexOf(e.originalEvent.keyCode) !== -1) return;

				methods.testCardValidity(e.target.value, e.target, settings);
			});

			settings.cvcInput.change(function (e) {
				methods.testCardCvc(e.target.value, e.target, settings);
			});

			settings.cvcInput.keyup(function (e) {
				if (permittedKeys.indexOf(e.originalEvent.keyCode) !== -1) return;

				methods.testCardCvc(e.target.value, e.target, settings);
			});

			el.submit(function() {
				return methods.testCard();
			});

			methods.testCard(settings);

			settings.numberInput.focus();
		});
	};
})(jQuery);
