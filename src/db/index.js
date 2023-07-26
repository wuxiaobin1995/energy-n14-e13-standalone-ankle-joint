/*
 * @Author      : Mr.bin
 * @Date        : 2023-06-25 11:44:25
 * @LastEditTime: 2023-07-26 15:07:17
 * @Description : Dexie
 */
import Dexie from 'dexie'

export function initDB() {
  const db = new Dexie('Energy_N14_E13_Standalone_Ankle_Joint') // 与项目名保持一致
  db.version(1).stores({
    user: 'userId,userName',
    test_data:
      '++,userId,pdfTime,type,[userId+type],[userId+pdfTime],[userId+type+pdfTime]',
    train_data:
      '++,userId,pdfTime,type,[userId+type],[userId+pdfTime],[userId+type+pdfTime]',
    mtt_data:
      '++,userId,pdfTime,type,[userId+type],[userId+pdfTime],[userId+type+pdfTime]'
  })
  return db
}
