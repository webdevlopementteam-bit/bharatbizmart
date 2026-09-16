// Central model registry. Next.js/Turbopack can compile different routes
// into separate module graphs, and Mongoose's model registry is populated
// lazily on first import — so a route that never directly imports, say,
// "User" but populates a `ref: "User"` field would throw
// `MissingSchemaError`. Importing every model here for side effects, and
// having lib/db/connect.js import this file, guarantees the full schema
// registry exists before any query runs, regardless of which route runs first.
import "./User.js";
import "./Vendor.js";
import "./Website.js";
import "./WebsiteTemplate.js";
import "./Domain.js";
import "./Category.js";
import "./SubCategory.js";
import "./Product.js";
import "./Service.js";
import "./Branch.js";
import "./Location.js";
import "./Enquiry.js";
import "./Lead.js";
import "./RFQ.js";
import "./Quotation.js";
import "./Conversation.js";
import "./Message.js";
import "./Review.js";
import "./SubscriptionPlan.js";
import "./Subscription.js";
import "./Payment.js";
import "./Invoice.js";
import "./Advertisement.js";
import "./Banner.js";
import "./Notification.js";
import "./Verification.js";
import "./Blog.js";
import "./BlogCategory.js";
import "./Page.js";
import "./Coupon.js";
import "./SupportTicket.js";
import "./AuditLog.js";
import "./Newsletter.js";
