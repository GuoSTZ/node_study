import express from 'express';
import { mysqlPool } from '../pool';
import multer from 'multer';
import xlsx from 'xlsx';
import dayjs from 'dayjs';
import { queryAsync } from '../utils';

const mysqlQuery = queryAsync(mysqlPool)

//创建路由对象
const router = express.Router();


/**
 * excel文件分析
 */
router.post('/excel/project', async (req: any, res: any, next: any) => {
  multer({ dest: 'uploads/' }).single('file')(req, res, async function (err) {
    if (err) {
      // 处理上传错误
      return res.status(400).json({ error: err.message });
    }
    // 获取上传的文件
    const file = req.file;
    // 读取Excel文件
    const workbook = xlsx.readFile(file.path);

    // 创建时间表
    const CREATE_TIME_TABLE: string = `CREATE TABLE IF NOT EXISTS dsbProjectTime (id INT PRIMARY KEY, time VARCHAR(50));`;
    // 插入时间数据
    let INSERT_TIME_DATA = `INSERT INTO dsbProjectTime (id, time) VALUES`;
    // 创建项目任务表
    const CREATE_PROJECT_TABLE: string = `CREATE TABLE IF NOT EXISTS dsbProjectTask (id INT AUTO_INCREMENT PRIMARY KEY, task VARCHAR(500) DEFAULT NULL, priority VARCHAR(10) DEFAULT NULL, assignee VARCHAR(50) DEFAULT NULL, completionDate BIGINT DEFAULT NULL, completionStatus VARCHAR(10) DEFAULT NULL, estimatedHours FLOAT DEFAULT NULL, notes VARCHAR(500) DEFAULT NULL, time_id INT, FOREIGN KEY (time_id) REFERENCES dsbProjectTime(id));`;
    // 插入项目任务数据
    let INSERT_PROJECT_DATA: string = `TRUNCATE TABLE dsbProjectTask; INSERT INTO dsbProjectTask (task, priority, assignee, completionDate, completionStatus, estimatedHours, notes, time_id) VALUES`
    // 版本发布sheet删除
    // 2022年10月和11月的sheet中布局与其他的不同，此处去除
    workbook.SheetNames = workbook.SheetNames.slice(0, -3)

    workbook.SheetNames.forEach((item: string, idx: number) => {
      const worksheet = workbook.Sheets[item];
      const split1 = idx === workbook.SheetNames.length - 1 ? '' : ','
      const dateKey = dayjs(item.replace("年", "-").replace("月", "-"), {format: "YYYY-MM"}).format("YYYYMM")
      INSERT_TIME_DATA += ` (${dateKey}, '${item}')${split1}`

      const jsonData: Array<string[]> = xlsx.utils.sheet_to_json(worksheet, { header: 1 })
      jsonData.filter(item => item.length > 0).forEach(item => {
        const [num, ...restItem] = item;
        // 只需要前7个数据，后续的数据删除
        restItem.length = 7;
        if (typeof num === 'number' && !!restItem[0]) {
          INSERT_PROJECT_DATA += " ("
          for (let i = 0; i < restItem.length; i++) {
            const cont = restItem[i];
            if (i === 2 && cont?.startsWith("@")) { // 截取负责人信息，去除冗余内容
              const _index = cont.indexOf("-");
              INSERT_PROJECT_DATA += `'${cont.slice(1, _index)}', `
            } else if (i === 3 && typeof cont === 'number') { // 将xlsx读取出来的日期转换为13位时间戳
              const excelDate = Date.parse('1900-01-01T00:00:00.000Z');
              const timestamp = excelDate + (cont - 1) * 24 * 3600 * 1000;
              INSERT_PROJECT_DATA += `${timestamp}, `
            } else if (i === 3 && typeof cont !== 'number') { // 如果不是正常日期数据，改为null处理
              INSERT_PROJECT_DATA += `null, `
            } else if (cont === undefined) { // 对于empty或undefined数据，改为null处理
              INSERT_PROJECT_DATA += `null, `
            } else {
              INSERT_PROJECT_DATA += `'${cont}', `
            }
          }
          INSERT_PROJECT_DATA += `${dateKey}` + "),"
        }
      })
    })

    INSERT_TIME_DATA += ` ON DUPLICATE KEY UPDATE time = VALUES(time);`;
    INSERT_PROJECT_DATA = INSERT_PROJECT_DATA.slice(0, -1);
    INSERT_PROJECT_DATA += ` ON DUPLICATE KEY UPDATE task = VALUES(task), priority = VALUES(priority), assignee = VALUES(assignee), completionDate = VALUES(completionDate), completionStatus = VALUES(completionStatus), estimatedHours = VALUES(estimatedHours), notes = VALUES(notes), time_id = VALUES(time_id);`
    try {
      await mysqlQuery(CREATE_TIME_TABLE);
      console.log('创建时间表成功')
      await mysqlQuery(INSERT_TIME_DATA);
      console.log('时间数据插入成功')
      await mysqlQuery(CREATE_PROJECT_TABLE);
      console.log('创建任务表成功')
      await mysqlQuery(INSERT_PROJECT_DATA);
      console.log('任务数据插入成功')
    } catch(error) {
      
      return next(error)
    }

    res.json({
      code: 0,
      data: null,
      message: 'success'
    })
  });
})

router.post('/project', async (req: any, res: any, next: any) => {
  const obj = req.body;
  // mysqlPool.query('selec')
  const queryItems = `
    SELECT * FROM ( 
      SELECT *, ROW_NUMBER() OVER () AS row_num FROM dsbProjectTask
    ) AS task_rows
    JOIN dsbProjectTime AS project_time ON task_rows.time_id = project_time.id
    WHERE row_num BETWEEN ? AND ?;
  `
  const queryTotal = `SELECT COUNT(*) AS total FROM dsbProjectTask;` 
  const startRow = (obj.current - 1) * obj.pageSize + 1, endRow = obj.current * obj.pageSize;
  try {
    const items = await mysqlQuery(queryItems, [startRow, endRow]);
    const totalResult: any = await mysqlQuery(queryTotal);
    res.send({ 
      code: 0, 
      data: {
        current: obj.current,
        pageSize: obj.pageSize,
        total: totalResult[0].total,
        items
      }, 
      message: 'success' 
    });
  } catch(err) {
    return next(err);
  }
})

export default router;