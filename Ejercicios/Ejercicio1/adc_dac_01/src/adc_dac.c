/* Protocolo de Comunicaciones
 * Ejercicio 1
 */

/*==================[inclusions]=============================================*/

//#include "adc_dac.h"   // <= own header (optional)
#include "sapi.h"        // <= sAPI header
#include "sd_spi.h"   // <= own header (optional)
#include "ff.h"       // <= Biblioteca FAT FS

#include <string.h>

/*==================[macros and definitions]=================================*/
#define FILENAME "Muestras.txt"

/*==================[internal data declaration]==============================*/

/*==================[internal functions declaration]=========================*/

/*==================[internal data definition]===============================*/
typedef char Buffer[10];
static Buffer uartBuff[4];

static FATFS fs;           // <-- FatFs work area needed for each volume
static FIL fp;             // <-- File object needed for each open file

/*==================[external data definition]===============================*/

/*==================[internal functions definition]==========================*/

char* itoa(int value, char* result, int base);

void stringDateTime( rtc_t * rtc );

void adcLog( void );

/*==================[external functions definition]==========================*/


/**
 * C++ version 0.4 char* style "itoa":
 * Written by Lukás Chmela
 * Released under GPLv3.

 */
/*===========================================================================*/
char* itoa(int value, char* result, int base) {
   // check that the base if valid
   if (base < 2 || base > 36) { *result = '\0'; return result; }

   char* ptr = result, *ptr1 = result, tmp_char;
   int tmp_value;

   do {
      tmp_value = value;
      value /= base;
      *ptr++ = "zyxwvutsrqponmlkjihgfedcba9876543210123456789abcdefghijklmnopqrstuvwxyz" [35 + (tmp_value - value * base)];
   } while ( value );

   // Apply negative sign
   if (tmp_value < 0) *ptr++ = '-';
   *ptr-- = '\0';
   while(ptr1 < ptr) {
      tmp_char = *ptr;
      *ptr--= *ptr1;
      *ptr1++ = tmp_char;
   }
   return result;
}
/*=============================================================================*/
/* Enviar la fecha y hora en formato "DD/MM/YYYY, HH:MM:SS" */
void stringDateTime( rtc_t * rtc ){

   /* Conversion de entero a ascii con base decimal */
   itoa( (int) (rtc->mday), (char*)uartBuff[3], 10 ); /* 10 significa decimal */
   /* Envio el dia */
   if( (rtc->mday)<10 ){
      uartWriteByte( UART_USB, '0' );
   }
   uartWriteString( UART_USB, uartBuff[3] );
   uartWriteByte( UART_USB, '/' );

   /* Conversion de entero a ascii con base decimal */
   itoa( (int) (rtc->month), (char*)uartBuff[3], 10 ); /* 10 significa decimal */
   /* Envio el mes */
   if( (rtc->month)<10 ){
      uartWriteByte( UART_USB, '0' );
   }
   uartWriteString( UART_USB, uartBuff[3] );
   uartWriteByte( UART_USB, '/' );

   /* Conversion de entero a ascii con base decimal */
   itoa( (int) (rtc->year), (char*)uartBuff[3], 10 ); /* 10 significa decimal */
   /* Envio el año */
   if( (rtc->year)<10 ){
      uartWriteByte( UART_USB, '0' );
   }
   uartWriteString( UART_USB, uartBuff[3] );
   uartWriteString( UART_USB, ", ");


   /* Conversion de entero a ascii con base decimal */
   itoa( (int) (rtc->hour), (char*)uartBuff[3], 10 ); /* 10 significa decimal */
   /* Envio la hora */
   if( (rtc->hour)<10 ){
      uartWriteByte( UART_USB, '0' );
   }
   uartWriteString( UART_USB, uartBuff[3] );
   uartWriteByte( UART_USB, ':' );

   /* Conversion de entero a ascii con base decimal */
   itoa( (int) (rtc->min), (char*)uartBuff[3], 10 ); /* 10 significa decimal */
   /* Envio los minutos */
   if( (rtc->min)<10 ){
	  uartWriteByte( UART_USB, '0' );
   }

   uartWriteString( UART_USB, uartBuff[3] );
   uartWriteByte( UART_USB, ':' );

   /* Conversion de entero a ascii con base decimal */
   itoa( (int) (rtc->sec), (char*)uartBuff[3], 10 ); /* 10 significa decimal */
   /* Envio los segundos */
   if( (rtc->sec)<10 ){
	  uartWriteByte( UART_USB, '0' );
   }
   uartWriteString( UART_USB, uartBuff[3] );

   /* Envio un 'enter' */
   uartWriteString( UART_USB, "\r\n");
}

// Implementacion de funcion de la tarea logTask
void adcLog( void ){
   adcConfig( ADC_ENABLE );

   // SPI configuration
   spiConfig( SPI0 );

   UINT nbytes;

   if( f_mount( &fs, "", 0 ) != FR_OK ){
         // If this fails, it means that the function could
         // not register a file system object.
         // Check whether the SD card is correctly connected
   }

   // Estructura RTC
   rtc_t rtc;
   rtc.year = 2018;
   rtc.month = 7;
   rtc.mday = 27;
   rtc.wday = 1;
   rtc.hour = 10;
   rtc.min = 35;
   rtc.sec= 0;

   bool_t val = rtcConfig( &rtc );
   delay(2000);

   bool_t ledState1 = OFF;

   uint32_t i = 0;

   uint16_t muestraCH1 = 0;
   uint16_t muestraCH2 = 0;
   uint16_t muestraCH3 = 0;

   delay_t delay1;
   delay_t delay2;

   delayConfig( &delay1, 600 );
   delayConfig( &delay2, 300 );

   // ---------- REPETIR POR SIEMPRE --------------------------
   while( TRUE )
   {
	   /* delayRead retorna TRUE */
	        if ( delayRead( &delay1 ) ){

	           /* Leo Entradas Analogicas */
	           muestraCH1 = adcRead( CH1 );
	           muestraCH2 = adcRead( CH2 );
	           muestraCH3 = adcRead( CH3 );

	           val = rtcRead( &rtc );

	           f_open( &fp, FILENAME, FA_WRITE | FA_OPEN_APPEND );

	           /* Conversión de muestra entera a ascii con base decimal */
	           itoa( muestraCH1, uartBuff[0], 10 ); /* 10 significa decimal */
	           itoa( muestraCH2, uartBuff[1], 10 ); /* 10 significa decimal */
	           itoa( muestraCH3, uartBuff[2], 10 ); /* 10 significa decimal */

	           /* Enviar muestra*/
	           uartWriteString( UART_USB, uartBuff[0] );
	           uartWriteString( UART_USB, ";\t" );

	           f_write( &fp, "CH1\t", 4, &nbytes );

	           uartWriteString( UART_USB, uartBuff[1] );
	           uartWriteString( UART_USB, ";\t" );

	           f_write( &fp, "CH2\t", 4, &nbytes );

	           uartWriteString( UART_USB, uartBuff[2] );
	           uartWriteString( UART_USB, ";\t" );

	           f_write( &fp, "CH3\t", 4, &nbytes );

	           stringDateTime( &rtc );

	           f_write( &fp, "HORA\t", 5, &nbytes );

	           f_close(&fp);
	        }

	        /* delayRead retorna TRUE*/
	        if ( delayRead( &delay2 ) ){
	           ledState1 = !ledState1;
	           gpioWrite( LED1, ledState1 );

	           i++;
	           if( i == 20 )
	              delayWrite( &delay2, 1000 );
	        }

	   }
}

/*===========================================================================*/

/* FUNCION PRINCIPAL, PUNTO DE ENTRADA AL PROGRAMA LUEGO DE RESET. */
int main(void){

   /* ------------- INICIALIZACIONES ------------- */

   /* Inicializar la placa */
   boardConfig();

   /* Inicializar UART_USB a 115200 baudios */
   uartConfig( UART_USB, 115200 );

   adcLog();

   // ---------- REPETIR POR SIEMPRE --------------------------
   while( TRUE )
   {
        // Si cae en este while 1 significa que no pudo iniciar el scheduler
        sleepUntilNextInterrupt();
   }
   // NO DEBE LLEGAR NUNCA AQUI, debido a que a este programa se ejecuta
   // directamenteno sobre un microcontroladore y no es llamado por ningun
   // Sistema Operativo, como en el caso de un programa para PC.
   return 0;

}

/*==================[end of file]============================================*/
