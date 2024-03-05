const mongoose = require('mongoose');
const setupTestDB = require('../../utils/setupTestDB');
const paginate = require('../../../src/models/plugins/paginate.plugin');

const projectSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  name2: {
    type: String,
    required: false,
  },
});

projectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
});

projectSchema.plugin(paginate);
const Project = mongoose.model('Project', projectSchema);

const taskSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  project: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Project',
    required: true,
  },
});

taskSchema.plugin(paginate);
const Task = mongoose.model('Task', taskSchema);

setupTestDB();

describe('Plugin: paginate', () => {
  describe('sortBy option', () => {
    test('should sort with a single data field', async () => {
      const projects = [];
      for (let i = 0; i < 8; i += 1) {
        projects.push(Project.create({ name: `Project ${i}` }));
      }
      await Promise.all(projects);

      const projectList = await Project.paginate({ name: { $regex: 'Project', $options: 'i' } }, { sortBy: 'name:desc' });
      const beforeEl = [...projectList.results].splice(0, projectList.results.length - 1);
      const afterEl = [...projectList.results].splice(1, projectList.results.length);
      const test = [];
      beforeEl.forEach((value, index) => {
        test.push(expect(value.name > afterEl[index].name).toBeTruthy());
      });

      await Promise.all(test);
    });

    test('should sort with multiple data field', async () => {
      const projects = [];
      for (let i = 0; i < 8; i += 1) {
        projects.push(Project.create({ name: `Project 0`, name2: `${i}` }));
      }
      await Promise.all(projects);

      const projectList = await Project.paginate(
        { name: { $regex: 'Project', $options: 'i' } },
        { sortBy: 'name:desc,name2:asc' }
      );
      const beforeEl = [...projectList.results].splice(0, projectList.results.length - 1);
      const afterEl = [...projectList.results].splice(1, projectList.results.length);
      const test = [];
      beforeEl.forEach((value, index) => {
        test.push(expect(value.name2 < afterEl[index].name2).toBeTruthy());
      });

      await Promise.all(test);
    });
  });

  describe('limit option', () => {
    test('should limit the result according to given params', async () => {
      const projects = [];
      for (let i = 0; i < 8; i += 1) {
        projects.push(Project.create({ name: `Project ${i}` }));
      }
      await Promise.all(projects);

      const projectList = await Project.paginate({ name: { $regex: 'Project', $options: 'i' } }, { limit: 2 });
      await expect(projectList.results.length).toEqual(2);
    });

    test('should limit the result with default 10', async () => {
      const projects = [];
      for (let i = 0; i < 20; i += 1) {
        projects.push(Project.create({ name: `Project ${i}` }));
      }
      await Promise.all(projects);

      const projectList = await Project.paginate({ name: { $regex: 'Project', $options: 'i' } }, { limit: -1 });
      await expect(projectList.results.length).toEqual(10);
    });

    test('should not limit the result when the length is too low', async () => {
      const projects = [];
      for (let i = 0; i < 1; i += 1) {
        projects.push(Project.create({ name: `Project ${i}` }));
      }
      await Promise.all(projects);

      const projectList = await Project.paginate({ name: { $regex: 'Project', $options: 'i' } }, { limit: 12 });
      await expect(projectList.results.length).toEqual(1);
    });
  });

  describe('page option', () => {
    test('should give the correct result with the given page', async () => {
      const projects = [];
      for (let i = 0; i < 8; i += 1) {
        projects.push(Project.create({ name: `Project ${i}` }));
      }
      await Promise.all(projects);

      const projectList = await Project.paginate({ name: { $regex: 'Project', $options: 'i' } }, { limit: 1, page: 3 });
      await expect(projectList.results[0].name).toStrictEqual('Project 2');
    });

    test('should give the empty result when page hits above max', async () => {
      const projects = [];
      for (let i = 0; i < 8; i += 1) {
        projects.push(Project.create({ name: `Project ${i}` }));
      }
      await Promise.all(projects);

      const projectList = await Project.paginate({ name: { $regex: 'Project', $options: 'i' } }, { limit: 1, page: 10 });
      await expect(projectList.results.length).toEqual(0);
    });
  });

  describe('filter option', () => {
    test('should give the correct result with the given filter', async () => {
      const projects = [];
      for (let i = 0; i < 8; i += 1) {
        projects.push(Project.create({ name: `Project ${i}` }));
      }
      await Promise.all(projects);

      const projectList = await Project.paginate({ name: 'Project 4' }, {});
      await expect(projectList.results[0].name).toStrictEqual('Project 4');
    });

    test('should give the empty result when filter hits no record', async () => {
      const projects = [];
      for (let i = 0; i < 8; i += 1) {
        projects.push(Project.create({ name: `Project ${i}` }));
      }
      await Promise.all(projects);

      const projectList = await Project.paginate({ name: 'Project 100' }, {});
      await expect(projectList.results.length).toEqual(0);
    });
  });

  describe('populate option', () => {
    test('should populate the specified data fields', async () => {
      const project = await Project.create({ name: 'Project One' });
      const task = await Task.create({ name: 'Task One', project: project._id });

      const taskPages = await Task.paginate({ _id: task._id }, { populate: 'project' });

      await expect(taskPages.results[0].project).toHaveProperty('_id', project._id);
    });

    test('should populate nested fields', async () => {
      const project = await Project.create({ name: 'Project One' });
      const task = await Task.create({ name: 'Task One', project: project._id });

      const projectPages = await Project.paginate({ _id: project._id }, { populate: 'tasks.project' });
      const { tasks } = projectPages.results[0];

      await expect(tasks).toHaveLength(1);
      await expect(tasks[0]).toHaveProperty('_id', task._id);
      await expect(tasks[0].project).toHaveProperty('_id', project._id);
    });
  });
});
