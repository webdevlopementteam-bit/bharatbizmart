import { requireUser, requireVendorContext, handleApiError, ApiError } from "@/lib/auth/guard";
import { ok } from "@/lib/utils/api";

export async function PUT(request, { params }) {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    const { employeeId } = await params;
    const body = await request.json();

    const employee = vendor.employees.id(employeeId);
    if (!employee) throw new ApiError(404, "Team member not found");

    if (body.role) employee.role = body.role;
    if (body.status) employee.status = body.status;
    if (body.permissions) employee.permissions = body.permissions;
    await vendor.save();

    return ok({ employees: vendor.employees });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await requireUser(["vendor"]);
    const vendor = await requireVendorContext(user);
    const { employeeId } = await params;

    const employee = vendor.employees.id(employeeId);
    if (!employee) throw new ApiError(404, "Team member not found");

    employee.deleteOne();
    await vendor.save();

    return ok({ employees: vendor.employees });
  } catch (err) {
    return handleApiError(err);
  }
}
