#include <stdio.h>
#include <PWM.h>

PWM pwm(GPIO_NUM_4);
pwm.setDutyPercentage(50);
pwm.setFrequency(100);

PWM::PWM(int gpioNum, uint32_t frequency, ledc_timer_bit_t dutyResolution, ledc_timer_t timer, ledc_channel_t channel) {
	ledc_timer_config_t timer_conf;
	timer_conf.duty_resolution    = dutyResolution;
	timer_conf.freq_hz    = frequency;
	timer_conf.speed_mode = LEDC_HIGH_SPEED_MODE;
	timer_conf.timer_num  = timer;
	ESP_ERROR_CHECK(::ledc_timer_config(&timer_conf));

	ledc_channel_config_t ledc_conf;
	ledc_conf.channel    = channel;
	ledc_conf.duty       = 0;
	ledc_conf.gpio_num   = gpioNum;
	ledc_conf.intr_type  = LEDC_INTR_DISABLE;
	ledc_conf.speed_mode = LEDC_HIGH_SPEED_MODE;
	ledc_conf.timer_sel  = timer;
	ESP_ERROR_CHECK(::ledc_channel_config(&ledc_conf));

	this->m_channel        = channel;
	this->m_timer          = timer;
	this->m_dutyResolution = dutyResolution;
} 

uint32_t PWM::getDuty() {
	return ::ledc_get_duty(LEDC_HIGH_SPEED_MODE, m_channel);
} // getDuty

uint32_t PWM::getFrequency() {
	return ::ledc_get_freq(LEDC_HIGH_SPEED_MODE, m_timer);
} // getFrequency

void PWM::setDuty(uint32_t duty) {
	ESP_ERROR_CHECK(::ledc_set_duty(LEDC_HIGH_SPEED_MODE, m_channel, duty));
	ESP_ERROR_CHECK(::ledc_update_duty(LEDC_HIGH_SPEED_MODE, m_channel));
} // setDuty

void PWM::setDutyPercentage(uint8_t percent) {
	uint32_t max;
	switch (m_dutyResolution) {
		case LEDC_TIMER_10_BIT:
			max = 1 << 10;
			break;
		case LEDC_TIMER_11_BIT:
			max = 1 << 11;
			break;
		case LEDC_TIMER_12_BIT:
			max = 1 << 12;
			break;
		case LEDC_TIMER_13_BIT:
			max = 1 << 13;
			break;
		case LEDC_TIMER_14_BIT:
			max = 1 << 14;
			break;
		case LEDC_TIMER_15_BIT:
			max = 1 << 15;
			break;
		default:
			max = 1 << 10;
			break;
	}
	if (percent > 100) percent = 100;
	uint32_t value = max * percent / 100;
	if (value >= max) value = max - 1;
	setDuty(value);
} // setDutyPercentage

void PWM::setFrequency(uint32_t freq) {
	ESP_ERROR_CHECK(::ledc_set_freq(LEDC_HIGH_SPEED_MODE, m_timer, freq));
} // setFrequency

void PWM::stop(bool idleLevel) {
	ESP_ERROR_CHECK(::ledc_stop(LEDC_HIGH_SPEED_MODE, m_channel, idleLevel ? 1 : 0));
} // stop
