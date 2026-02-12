// const Job = require("../models/Job");
// const AppError = require("../utils/appError");
// const catchAsync = require("../utils/catchAsync");

// const createJob = catchAsync(async (req, res) => {
//   const { title, description, budget } = req.body;

//   const data = await Job.create({
//     title,
//     description,
//     client: req.user.id,
//     budget,
//   });

//   res.status(200).json({
//     status: "success",
//     data,
//   });
// });

// const findJobs = catchAsync(async (req, res) => {
//   const data = await Job.find({}).populate("client", "name email");

//   if (!data) throw new AppError(400, "No Job found ");

//   res.status(200).json({
//     status: "success",
//     data,
//   });
// });
// const findMyJobs = catchAsync(async (req, res) => {
//   const data = await Job.find({ client: req.user.id });

//   if (!data) throw new AppError(400, "No Job found ");

//   res.status(200).json({
//     status: "success",
//     data,
//   });
// });

// // PATCH /api/jobs/:id/mark-completed
// const markCompleted = catchAsync(async (req, res, next) => {
//   //verify job.freelancer = req.user.id

//   const jobId = req.params.id;

//   // only allow if job is currently "in-progress"
//   const job = await Job.findOneAndUpdate(
//     { _id: jobId, status: "in-progress", hiredFreelancer: req.user.id }, // filter
//     { status: "completed-request" }, // update
//     { new: true } // return updated doc
//   );

//   if (!job) {
//     return next(
//       new AppError(
//         "Job not found or not in-progress, cannot mark as completed",
//         400
//       )
//     );
//   }

//   res.status(200).json({
//     status: "success",
//     message: "Job marked as completed. Waiting for client approval.",
//     job,
//   });
// });

// const approveCompletion = catchAsync(async (req, res, next) => {
//   const jobId = req.params.id;
//   //verify that the client is approving it , req.user = job.client

//   const job = await Job.findOneAndUpdate(
//     {
//       _id: jobId,
//       status: "completed-request",
//       client: req.user.id,
//     },
//     { status: "completed" },
//     { new: true }
//   );
//   if (!job)
//     throw new AppError(
//       "The job has not been marked completed or (you are not the authorized client for approval ) ",
//       404
//     );

//   res.status(200).json({
//     status: "success",
//     job,
//     message: "Succesfully marked job completed",
//   });
// });

// module.exports = {
//   createJob,
//   findJobs,
//   markCompleted,
//   approveCompletion,
//   findMyJobs,
// };
